import { vitalSignsEcgData } from "@/data/scichart-vital-signs-data";

export type SeriesId =
  | "ecg"
  | "bloodPressure"
  | "bloodVolume"
  | "bloodOxygenation";

type Subscriber = {
  seriesId: SeriesId;
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
  currentPoint = (currentPoint + STEP) % DATA_LENGTH;

  subscribers.forEach((subscriber) => {
    const yValues = getSeriesSlice(subscriber.seriesId, startIndex);
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

// dataSeries param kept for API compatibility but ignored -- Recharts uses onSample callback only
export const subscribeToWaveformStream = (
  seriesId: SeriesId,
  _dataSeries: unknown,
  onSample?: (value: number) => void,
) => {
  const subscriber: Subscriber = { seriesId, onSample };
  subscribers.add(subscriber);
  ensureTimer();
  return () => {
    subscribers.delete(subscriber);
    stopTimerIfIdle();
  };
};
