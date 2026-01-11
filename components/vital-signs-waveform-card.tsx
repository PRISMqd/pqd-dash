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
import { useEffect, useMemo, useState } from "react";
import {
  CategoryAxis,
  EAutoRange,
  EllipsePointMarker,
  FastLineRenderableSeries,
  NumberRange,
  NumericAxis,
  SciChartJSLightTheme,
  SciChartSurface,
} from "scichart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  prewarmWaveformSeries,
  type SeriesId,
  subscribeToWaveformStream,
  WAVEFORM_STREAM_CONSTANTS,
} from "@/data/vital-signs-stream";
import { cn } from "@/lib/utils";

const STROKE_THICKNESS = 4;

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

const configureSciChartEnvironment = () => {
  if (typeof window === "undefined") {
    return;
  }

  const licenseKey = process.env.NEXT_PUBLIC_SCICHART_LICENSE_KEY;
  if (licenseKey) {
    SciChartSurface.setRuntimeLicenseKey(licenseKey);
  } else {
    SciChartSurface.UseCommunityLicense();
  }

  const wasmUrl =
    process.env.NEXT_PUBLIC_SCICHART_WASM_URL ?? "/_wasm/scichart2d.wasm";
  SciChartSurface.configure({ wasmUrl });
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

  const surfacePromise = useMemo(
    () => ({ current: null as null | Promise<void> }),
    [],
  );
  const surfaceContainerId = useMemo(() => `${chartId}-surface`, [chartId]);

  useEffect(() => {
    const container = document.getElementById(surfaceContainerId);
    if (!(container instanceof HTMLDivElement)) {
      return;
    }

    configureSciChartEnvironment();

    container.replaceChildren();
    container.style.position = "absolute";
    container.style.left = "-0.5rem";
    container.style.width = "calc(100% + 1rem)";
    container.style.height = "calc(100%)";

    const { POINTS_LOOP, GAP_POINTS } = WAVEFORM_STREAM_CONSTANTS;

    let surface: SciChartSurface | undefined;
    let unsubscribe: (() => void) | undefined;

    const createChart = async () => {
      const { sciChartSurface, wasmContext } = await SciChartSurface.create(
        container,
        {
          theme: new SciChartJSLightTheme(),
        },
      );

      surface = sciChartSurface;

      const theme = new SciChartJSLightTheme();
      theme.sciChartBackground = "transparent";
      theme.gridBackgroundBrush = "transparent";
      theme.loadingAnimationBackground = "transparent";
      theme.labelBackgroundBrush = "transparent";
      sciChartSurface.applyTheme(theme);
      sciChartSurface.background = "transparent";
      sciChartSurface.chartModifiers.clear();

      const xAxis = new CategoryAxis(wasmContext, {
        visibleRange: new NumberRange(0, POINTS_LOOP),
        isVisible: false,
        autoRange: EAutoRange.Never,
      });
      xAxis.drawLabels = false;
      xAxis.drawMajorGridLines = false;
      xAxis.drawMinorGridLines = false;
      xAxis.drawMajorTickLines = false;
      xAxis.drawMinorTickLines = false;
      sciChartSurface.xAxes.add(xAxis);

      const yAxis = new NumericAxis(wasmContext, {
        isVisible: false,
        autoRange: EAutoRange.Always,
      });
      yAxis.growBy = new NumberRange(0.1, 0.1);
      yAxis.drawLabels = false;
      yAxis.drawMajorGridLines = false;
      yAxis.drawMinorGridLines = false;
      yAxis.drawMajorTickLines = false;
      yAxis.drawMinorTickLines = false;
      sciChartSurface.yAxes.add(yAxis);

      const dataSeries = prewarmWaveformSeries(
        config.seriesId,
        wasmContext,
        POINTS_LOOP,
        GAP_POINTS,
      );

      const pointMarker = new EllipsePointMarker(wasmContext, {
        width: 7,
        height: 7,
        strokeThickness: 2,
        fill: config.strokeColor,
        stroke: config.strokeColor,
        lastPointOnly: true,
      });

      const renderableSeries = new FastLineRenderableSeries(wasmContext, {
        dataSeries,
        stroke: config.strokeColor,
        strokeThickness: config.strokeThickness ?? STROKE_THICKNESS,
        pointMarker,
        strokeDashArray: [],
      });

      sciChartSurface.renderableSeries.add(renderableSeries);

      unsubscribe = subscribeToWaveformStream(
        config.seriesId,
        dataSeries,
        (value) => {
          setCurrentValue(value);
          onSample?.(value);
        },
      );
    };

    const promise = createChart();
    surfacePromise.current = promise;

    return () => {
      unsubscribe?.();
      surface?.delete();
    };
  }, [
    config.seriesId,
    config.strokeColor,
    config.strokeThickness,
    onSample,
    surfaceContainerId,
    surfacePromise,
  ]);

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

        {/* Transparent waveform area */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 relative cursor-help">
              <div id={surfaceContainerId} />

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
