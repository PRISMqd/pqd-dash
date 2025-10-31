#!/usr/bin/env bun
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import potrace from "potrace";

const resolveFromRepoRoot = (relativePath: string) => {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(moduleDir, "..");
  return path.resolve(repoRoot, relativePath);
};

const toGrayscale = (data: Uint8Array) => {
  const grayscale = new Uint8Array(data.length / 4);

  for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    grayscale[j] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  }

  return grayscale;
};

const otsuThreshold = (grayscale: Uint8Array) => {
  const histogram = new Array<number>(256).fill(0);
  const total = grayscale.length;

  for (let i = 0; i < grayscale.length; i += 1) {
    histogram[grayscale[i]] += 1;
  }

  let sum = 0;
  for (let i = 0; i < 256; i += 1) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t += 1) {
    wB += histogram[t];
    if (wB === 0) {
      continue;
    }

    wF = total - wB;
    if (wF === 0) {
      break;
    }

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);

    if (between > varMax) {
      varMax = between;
      threshold = t;
    }
  }

  return threshold;
};

const toBinaryPngBuffer = (png: PNG) => {
  const grayscale = toGrayscale(png.data);
  const threshold = otsuThreshold(grayscale);
  const binaryPng = new PNG({ width: png.width, height: png.height });

  for (let i = 0, j = 0; i < png.data.length; i += 4, j += 1) {
    const value = grayscale[j] >= threshold ? 0 : 255;

    binaryPng.data[i + 0] = value;
    binaryPng.data[i + 1] = value;
    binaryPng.data[i + 2] = value;
    binaryPng.data[i + 3] = 255;
  }

  return PNG.sync.write(binaryPng);
};

const extractPathData = (pathTag: string) => {
  const match = pathTag.match(/d="([^"]+)"/);
  return match ? match[1] : "";
};

const traceWithPotrace = async (
  binaryBuffer: Buffer,
  options?: Record<string, unknown>,
) => {
  const tracer = new potrace.Potrace({
    turdSize: 20,
    optTolerance: 0.35,
    turnPolicy: potrace.Potrace.TURNPOLICY_MAJORITY,
    color: "black",
    background: "transparent",
    ...(options ?? {}),
  });

  const loadImage = (input: Buffer) =>
    new Promise<void>((resolve, reject) => {
      tracer.loadImage(input, (err: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

  await loadImage(binaryBuffer);

  const pathTag = tracer.getPathTag("black");
  return extractPathData(pathTag);
};

const [, , rawInput, rawOutput] = process.argv;

const input = resolveFromRepoRoot(rawInput ?? "public/images/body-diagram.png");
const output = resolveFromRepoRoot(
  rawOutput ?? "public/images/body-diagram.svg",
);

console.log(`Vectorizing ${input} -> ${output}`);

(async () => {
  try {
    const buffer = await readFile(input);
    const png = PNG.sync.read(buffer);
    const binaryBuffer = toBinaryPngBuffer(png);
    const pathData = await traceWithPotrace(binaryBuffer, {
      width: png.width,
      height: png.height,
    });

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}" role="img" aria-labelledby="torsoTitle torsoDesc">
  <title id="torsoTitle">Torso lead placement</title>
  <desc id="torsoDesc">Side profile of a human torso with electrode leads shown as dots along the left chest.</desc>
  <defs>
    <linearGradient id="torsoGradient" x1="${png.width * 0.28}" y1="${png.height * 0.08}" x2="${png.width * 0.82}" y2="${png.height * 0.98}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6efcd0" />
      <stop offset="0.4" stop-color="#22d3ad" />
      <stop offset="1" stop-color="#067c63" />
    </linearGradient>
  </defs>
  <path d="${pathData}" fill="url(#torsoGradient)" stroke="#0c8f78" stroke-width="1" shape-rendering="geometricPrecision" />
</svg>`;

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, svg, "utf8");

    console.log(
      `Converted ${path.relative(process.cwd(), input)} → ${path.relative(process.cwd(), output)} (${svg.length} bytes SVG)`,
    );
  } catch (error) {
    console.error("Vectorization failed:", error);
    process.exitCode = 1;
  }
})();
