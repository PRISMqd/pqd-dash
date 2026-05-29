"use client";

import type { CSSProperties } from "react";
import type { WaveformState } from "@/components/medical-dashboard/types";
import {
  Bookmark,
  Layers,
  Maximize2,
  Search,
  Settings,
  Share,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SeriesId } from "@/data/vital-signs-stream";
import { subscribeToWaveformStream } from "@/data/vital-signs-stream";
import { vitalSignsEcgData } from "@/data/scichart-vital-signs-data";
import { cn } from "@/lib/utils";

const BUFFER_SIZE = 120;

const SERIES_DATA_MAP: Record<SeriesId, readonly number[]> = {
  ecg: vitalSignsEcgData.ecgHeartRateValues,
  bloodPressure: vitalSignsEcgData.bloodPressureValues,
  bloodVolume: vitalSignsEcgData.bloodVolumeValues,
  bloodOxygenation: vitalSignsEcgData.bloodOxygenationValues,
};

// OMO content per COPY.md Box 10
const WAVEFORM_OMO = {
  observation: "Signals streaming in real time.",
  meaning: "All monitored parameters within expected ranges; no loss detected.",
  options: "Select a waveform to expand, compare, or mark an event.",
};

// Waveform state visual styles per COPY.md Box 10
const WAVEFORM_STATE_STYLES: Record<
  WaveformState,
  { trace: string; label: string }
> = {
  stable: { trace: "#218F67", label: "Waveforms stable; sampling normal." },
  trending: { trace: "#D1C247", label: "Gradual upward/downward trend noted." },
  critical: {
    trace: "#C22D4D",
    label: "Sustained deviation beyond threshold — review trend detail.",
  },
  artifact: {
    trace: "#6B7280",
    label: "Data interruption > 10 s — possible lead movement or artifact.",
  },
};

// Tooltips for waveform segments per COPY.md Box 10
const WAVEFORM_TOOLTIPS: Record<SeriesId, { segment: string; trend: string }> =
  {
    ecg: {
      segment: "Displays raw ECG signal amplitude and sampling interval.",
      trend: "Represents heart rate change from baseline over last 30 min.",
    },
    bloodPressure: {
      segment: "Displays arterial pressure waveform.",
      trend: "BP trend from baseline.",
    },
    bloodVolume: {
      segment: "Displays respiratory effort and blood volume changes.",
      trend: "Respiratory rate trend.",
    },
    bloodOxygenation: {
      segment: "Displays SpO₂ plethysmography waveform.",
      trend: "Oxygen saturation trend.",
    },
  };

export type VitalSignsWaveformCardProps = {
  chartId: string;
  config: {
    seriesId: SeriesId;
    strokeColor: string;
    yRange: [number, number];
    strokeThickness?: number;
  };
  displayValue?: string;
  label?: string;
  unit?: string;
  showDelta?: boolean;
  style?: CSSProperties;
  onSampleAction?: (value: number) => void;
  alertLevel?: "normal" | "warning" | "critical";
  waveformState?: WaveformState;
  onMarkEvent?: () => void;
  onExpandChart?: () => void;
};

export function VitalSignsWaveformCard({
  chartId,
  config,
  displayValue,
  label,
  unit = "",
  showDelta = false,
  style,
  onSampleAction: onSample,
  alertLevel,
  waveformState = "stable",
  onMarkEvent,
  onExpandChart,
}: VitalSignsWaveformCardProps) {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  const initBuffer = () => {
    const source = SERIES_DATA_MAP[config.seriesId];
    return Array.from({ length: BUFFER_SIZE }, (_, i) => ({
      v: source[i % source.length],
    }));
  };

  const [buffer, setBuffer] = useState<{ v: number }[]>(initBuffer);
  const bufferRef = useRef<{ v: number }[]>(initBuffer());

  useEffect(() => {
    const unsubscribe = subscribeToWaveformStream(
      config.seriesId,
      null as never,
      (value) => {
        setCurrentValue(value);
        onSample?.(value);
        const next = [...bufferRef.current.slice(1), { v: value }];
        bufferRef.current = next;
        setBuffer([...next]);
      },
    );
    return () => unsubscribe?.();
  }, [config.seriesId, onSample]);

  const formatValue = (val: number): string => {
    if (config.seriesId === "bloodPressure") {
      return Math.round(val).toString();
    } else if (config.seriesId === "bloodOxygenation") {
      return `${Math.round(val * 100)}%`;
    } else {
      return Math.round(val).toString();
    }
  };

  const effectiveLevel = alertLevel ?? "normal";
  const stateStyle = WAVEFORM_STATE_STYLES[waveformState];
  const tooltip = WAVEFORM_TOOLTIPS[config.seriesId];

  const levelColor = (() => {
    if (effectiveLevel === "critical") return "var(--dl-crisis)";
    if (effectiveLevel === "warning") return "var(--dl-warning)";
    return "#6aa194";
  })();

  const valueBg = (() => {
    if (effectiveLevel === "critical") return "var(--dl-crisis)";
    if (effectiveLevel === "warning") return "var(--dl-warning)";
    return "#7bb8a9";
  })();

  const valueText =
    effectiveLevel === "critical"
      ? "#fff7f8"
      : effectiveLevel === "warning"
        ? "var(--dl-text-primary)"
        : "var(--dl-text-primary)";

  return (
    <TooltipProvider>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover state for visual enhancement only */}
      <div
        id={chartId}
        className={cn(
          "flex items-stretch gap-2 relative",
          isHovered && "ring-1 ring-primary/30 rounded-lg",
        )}
        style={style}
        data-testid={`waveform-card-${chartId}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left handle bar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="w-3 rounded-md cursor-help"
              style={
                {
                  backgroundColor: valueBg,
                  border: `1.5px solid ${levelColor}`,
                } as CSSProperties
              }
            />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold">{label ?? config.seriesId}</div>
              <div className="text-xs">{stateStyle.label}</div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Waveform area */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 relative cursor-help overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buffer} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                  <YAxis
                    domain={["auto", "auto"]}
                    hide
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={waveformState === "artifact" ? "#6B7280" : config.strokeColor}
                    strokeWidth={config.strokeThickness ?? 2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Trend overlay on hover */}
              {isHovered && (
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkEvent?.();
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] bg-primary/80 text-primary-foreground hover:bg-primary transition-colors inline-flex items-center gap-1"
                  >
                    <Bookmark className="w-3 h-3" /> Mark
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpandChart?.();
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] bg-primary/80 text-primary-foreground hover:bg-primary transition-colors inline-flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" /> Expand
                  </button>
                </div>
              )}

              {/* Artifact/data loss indicator */}
              {waveformState === "artifact" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <span className="text-xs text-muted-foreground italic">
                    Signal unavailable
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="text-xs">{tooltip.segment}</div>
              <div className="text-xs text-muted-foreground">
                {tooltip.trend}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Value display box on the right */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="rounded-lg px-3 py-2 flex flex-col items-center justify-center min-w-20 cursor-help"
              style={{
                backgroundColor:
                  effectiveLevel === "normal" ? `${valueBg}e6` : `${valueBg}`,
                borderRadius: "var(--dl-radius)",
                border: `1.5px solid ${levelColor}`,
              }}
            >
              {label && (
                <div
                  className="text-[10px] font-medium uppercase tracking-wider mb-1"
                  style={{ color: valueText }}
                >
                  {label}
                </div>
              )}
              <div
                className="text-2xl font-bold leading-none"
                style={{ color: valueText }}
              >
                {showDelta ? "Δ" : (displayValue ?? formatValue(currentValue))}
              </div>
              {unit && !showDelta && (
                <div className="text-xs mt-0.5" style={{ color: valueText }}>
                  {unit}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              Click to view trend comparison and baseline.
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

// Expanded Waveform View for modal
export function WaveformExpandedView({
  config,
  label,
  unit,
  onClose,
}: {
  config: {
    seriesId: SeriesId;
    strokeColor: string;
    yRange: [number, number];
  };
  label?: string;
  unit?: string;
  onClose: () => void;
}) {
  const tooltip = WAVEFORM_TOOLTIPS[config.seriesId];

  return (
    <div
      className="relative w-full max-w-4xl min-h-[50vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Waveform expanded view"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close waveform view"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">
          {label ?? config.seriesId} {unit && `(${unit})`}
        </h2>
        <p className="text-base text-[#1e2a28]/80">{WAVEFORM_OMO.meaning}</p>
        <p className="text-sm text-[#1e2a28]/60">{tooltip.segment}</p>
      </div>

      {/* Waveform placeholder */}
      <div className="flex-1 min-h-[200px] rounded-xl bg-[#9fcac0] border border-[#3F6E67]/30 flex items-center justify-center">
        <span className="text-[#1e2a28]/50">Expanded waveform view</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-14 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-medium">Zoom/Pan</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Scroll or pinch to view prior 12 h or focus on last 15 min.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-14 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-medium">Overlay</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Add or remove signals for correlation (e.g., HR ↔ RR ↔ SpO₂).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-14 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-[10px] font-medium">Mark Event</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Tag this time point with a note or intervention label.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-14 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-[10px] font-medium">Scale</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Modify amplitude or range for clearer visualization.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-14 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Share className="w-5 h-5" />
                <span className="text-[10px] font-medium">Export</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Generate secure data snippet for review or case study.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
