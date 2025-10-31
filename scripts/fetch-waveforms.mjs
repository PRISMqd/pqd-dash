import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const CHANNEL = "1283400";
const RESULTS = 3600;
const ENDPOINT = (field) =>
  `https://thingspeak.com/channels/${CHANNEL}/fields/${field}.csv?results=${RESULTS}`;

async function fetchCsv(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "pqd-dashboard-waveform-fetch" },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

function parseSeries(csvText) {
  const cleaned = csvText.replaceAll('"', "");
  const rows = cleaned
    .split(/\r?\n/)
    .filter((line, idx) => idx === 0 || line.trim());
  const values = [];
  for (let i = 1; i < rows.length; i++) {
    const [, , field] = rows[i].split(",");
    const num = Number(field);
    if (!Number.isNaN(num)) values.push(num);
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return values.map((v) => v - mean);
}

function downsample(values, targetLength) {
  if (values.length <= targetLength) return values.slice();
  const factor = values.length / targetLength;
  return Array.from({ length: targetLength }, (_, idx) => {
    const start = idx * factor;
    const end = (idx + 1) * factor;
    let sum = 0;
    let count = 0;
    for (let i = Math.floor(start); i < Math.ceil(end); i++) {
      sum += values[i];
      count++;
    }
    return sum / count;
  });
}

async function main() {
  const [ecgCsv, ppgCsv] = await Promise.all([
    fetchCsv(ENDPOINT(1)),
    fetchCsv(ENDPOINT(2)),
  ]);
  const ecgRaw = parseSeries(ecgCsv).map((v) => v / 512);
  const plethRaw = parseSeries(ppgCsv).map((v) => v / 1024);
  const ecg = downsample(ecgRaw, 1200);
  const pleth = downsample(plethRaw, 1200);
  mkdirSync(resolve(root, "data"), { recursive: true });
  const output = `export const ECG_TEMPLATE = ${JSON.stringify(ecg)} as const;\nexport const PLETH_TEMPLATE = ${JSON.stringify(pleth)} as const;\n`;
  writeFileSync(resolve(root, "data/waveforms.ts"), output);
  console.log(
    `Wrote ${ecg.length} ECG samples and ${pleth.length} pleth samples to data/waveforms.ts`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
