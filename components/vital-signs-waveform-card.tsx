"use client";

import type { CSSProperties } from "react";
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
  prewarmWaveformSeries,
  type SeriesId,
  subscribeToWaveformStream,
  WAVEFORM_STREAM_CONSTANTS,
} from "@/data/vital-signs-stream";

const STROKE_THICKNESS = 4;

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
  onSample?: (value: number) => void;
};

export function VitalSignsWaveformCard({
  chartId,
  config,
  displayValue,
  label,
  unit = "",
  showDelta = false,
  style,
  onSample,
}: VitalSignsWaveformCardProps) {
  const [currentValue, setCurrentValue] = useState<number>(0);

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
        // visibleRange: new NumberRange(config.yRange[0], config.yRange[1]),
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

  return (
    <div
      id={chartId}
      className="flex items-stretch gap-2"
      style={style}
      data-testid={`waveform-card-${chartId}`}
    >
      {/* Left handle bar from PDF */}
      <div
        className="w-3 rounded-md opacity-50 bg-[var(--waveform-stroke)]"
        style={
          {
            "--waveform-stroke": config.strokeColor,
          } as CSSProperties
        }
      />

      {/* Transparent waveform area */}
      <div className="flex-1 relative">
        <div id={surfaceContainerId} />
      </div>

      {/* Value display box on the right */}
      <div className="bg-[#7BB8A9]/20 rounded-lg px-3 py-2 flex flex-col items-center justify-center min-w-[80px]">
        {label && (
          <div className="text-[10px] font-medium text-[#3F6E67] uppercase tracking-wider mb-1">
            {label}
          </div>
        )}
        <div className="text-2xl font-bold text-[#1E2A28] leading-none">
          {showDelta ? "Δ" : (displayValue ?? formatValue(currentValue))}
        </div>
        {unit && !showDelta && (
          <div className="text-xs text-[#3F6E67] mt-0.5">{unit}</div>
        )}
      </div>
    </div>
  );
}
