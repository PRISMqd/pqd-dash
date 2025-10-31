#!/usr/bin/env node

import { createServer } from "node:http";
import process from "node:process";
import next from "next";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 3100;

const app = next({
  dev: true,
  dir: process.cwd(),
  hostname: HOST,
  port: PORT,
});

const log = (...args) => {
  console.log("[verify-waveforms]", ...args);
};

let browser;
let server;

const fail = async (error) => {
  console.error("[verify-waveforms] ERROR:", error);
  if (browser) {
    await browser.close();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await app.close();
  process.exit(1);
};

try {
  await app.prepare();
  const requestHandler = app.getRequestHandler();
  server = createServer((req, res) => requestHandler(req, res));

  await new Promise((resolve) => {
    server.listen(PORT, HOST, () => {
      log(`Next.js dev server listening at http://${HOST}:${PORT}`);
      resolve();
    });
  });

  browser = await chromium.launch();
  const page = await browser.newPage();

  log("Navigating to dashboard…");
  await page.goto(`http://${HOST}:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);

  const waveformStats = await page.$$eval(
    '[data-testid^="waveform-canvas"]',
    (containers) => {
      return containers.map((container) => {
        const canvas = container.querySelector("canvas");
        if (!canvas) {
          return { hasCanvas: false, variance: 0 };
        }
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          return { hasCanvas: false, variance: 0 };
        }
        const { width, height } = canvas;
        if (!width || !height) {
          return { hasCanvas: true, variance: 0 };
        }
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let sum = 0;
        let sumSq = 0;
        const sampleStep = Math.max(1, Math.floor((width * height) / 2000));
        for (let i = 0; i < data.length; i += 4 * sampleStep) {
          const value = data[i] + data[i + 1] + data[i + 2];
          sum += value;
          sumSq += value * value;
        }
        const sampleCount = Math.ceil(data.length / (4 * sampleStep));
        const mean = sum / sampleCount;
        const variance = sumSq / sampleCount - mean * mean;
        return { hasCanvas: true, variance };
      });
    },
  );

  const missingCanvas = waveformStats.findIndex(
    (stat) => stat.hasCanvas === false,
  );
  if (missingCanvas !== -1) {
    throw new Error(
      `Waveform container #${missingCanvas + 1} does not contain a canvas`,
    );
  }

  const flatWaveform = waveformStats.findIndex((stat) => stat.variance < 1_000);
  if (flatWaveform !== -1) {
    throw new Error(
      `Waveform canvas #${flatWaveform + 1} appears blank (variance ${waveformStats[flatWaveform].variance.toFixed(2)})`,
    );
  }

  await page.screenshot({
    path: "waveform-verification.png",
    fullPage: true,
  });
  log("Waveforms verified. Screenshot saved to waveform-verification.png");

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await app.close();
  process.exit(0);
} catch (error) {
  await fail(error);
}
