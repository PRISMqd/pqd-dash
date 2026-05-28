import { TSciChart, XyDataSeries } from "scichart";
import { vitalSignsEcgData } from "@/data/scichart-vital-signs-data";

type SeriesId = "ecg" | "bloodPressure" | "bloodVolume" | "bloodOxygenation";

type Subscriber = {
  seriesId: SeriesId;
  dataSeries: XyDataSeries;
  onSample?: (value: number) => void;
};

const STEP = 10;
const TIMER_TIMEOUT_MS = 20;
const POINTS_LOOP = 5200;
const GAP_POINTS = 50;
const DATA_LENGTH = vitalSignsEcgData.xValues.length;

const SERIES_DATA_MAP: Record<SeriesId, readonly number[]> = {
  ecg: vitalSignsEcgData.ecgHeartRateValues,
  bloodPressure: vitalSignsEcgData.bloodPressureValues,
  bloodVolume: vitalSignsEcgData.bloodVolumeValues,
  bloodOxygenation: vitalSignsEcgData.bloodOxygenationValues,
};

const subscribers = new Set<Subscriber>();
let timerId: number | null = null;
let currentPoint = 0;

const createXValues = (start: number) => {
  const values = new Array<number>(STEP);
  for (let i = 0; i < STEP; i++) {
    values[i] = start + i;
  }
  return values;
};

const getSeriesSlice = (seriesId: SeriesId, startIndex: number) => {
  const source = SERIES_DATA_MAP[seriesId];
  const values = new Array<number>(STEP);
  for (let i = 0; i < STEP; i++) {
    const dataIndex = (startIndex + i) % DATA_LENGTH;
    values[i] = source[dataIndex];
  }
  return values;
};

const tick = () => {
  const startIndex = currentPoint;
  const xValues = createXValues(startIndex);
  currentPoint = (currentPoint + STEP) % DATA_LENGTH;

  subscribers.forEach((subscriber) => {
    const yValues = getSeriesSlice(subscriber.seriesId, startIndex);
    subscriber.dataSeries.appendRange(xValues, yValues);
    subscriber.onSample?.(yValues[yValues.length - 1]);
  });

  timerId = window.setTimeout(tick, TIMER_TIMEOUT_MS);
};

const ensureTimer = () => {
  if (timerId === null) {
    timerId = window.setTimeout(tick, TIMER_TIMEOUT_MS);
  }
};

const stopTimerIfIdle = () => {
  if (subscribers.size === 0 && timerId !== null) {
    window.clearTimeout(timerId);
    timerId = null;
    currentPoint = 0;
  }
};

export const WAVEFORM_STREAM_CONSTANTS = {
  POINTS_LOOP,
  GAP_POINTS,
};

export const prewarmWaveformSeries = (
  seriesId: SeriesId,
  wasmContext: TSciChart,
  fifoCapacity: number,
  fifoGap: number,
) => {
  const dataSeries = new XyDataSeries(wasmContext, {
    fifoCapacity,
    fifoSweeping: true,
    fifoSweepingGap: fifoGap,
  });

  dataSeries.appendRange(
    Array.from(vitalSignsEcgData.xValues),
    Array.from(SERIES_DATA_MAP[seriesId]),
  );

  return dataSeries;
};

export const subscribeToWaveformStream = (
  seriesId: SeriesId,
  dataSeries: XyDataSeries,
  onSample?: (value: number) => void,
) => {
  const subscriber: Subscriber = { seriesId, dataSeries, onSample };
  subscribers.add(subscriber);
  ensureTimer();

  return () => {
    subscribers.delete(subscriber);
    stopTimerIfIdle();
  };
};

export type { SeriesId };
