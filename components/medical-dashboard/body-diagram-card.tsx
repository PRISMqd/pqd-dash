"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { AlertLevel } from "@/components/alert-state-context";
import type {
  SensorInfo,
  SensorLocation,
  SensorStatus,
} from "@/components/medical-dashboard/types";
import { Activity, Heart, PersonStanding, Wind, X } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const BODY_DIAGRAM_IMAGE_STYLE: CSSProperties = {
  objectFit: "cover",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
};

// Sensor status colors per COPY.md Box 9
const SENSOR_STATUS_COLORS: Record<
  SensorStatus,
  { fill: string; glow?: string }
> = {
  connected: { fill: "#4B90A6", glow: "rgba(75, 144, 166, 0.3)" },
  trending: { fill: "#D1C247", glow: "rgba(209, 194, 71, 0.4)" },
  critical: { fill: "#C22D4D", glow: "rgba(194, 45, 77, 0.5)" },
  disconnected: { fill: "#6B7280" },
};

// Alert level to sensor status mapping
const ALERT_LEVEL_TO_STATUS: Record<AlertLevel, SensorStatus> = {
  normal: "connected",
  warning: "trending",
  critical: "critical",
};

// Sensor tooltips per COPY.md Box 9
const SENSOR_TOOLTIPS: Record<
  SensorLocation,
  { label: string; connected: string; disconnected: string }
> = {
  chest: {
    label: "Chest Pod (ECG / HR / HRV / PI / Temp)",
    connected: "Heart sensor active; waveform stable. Leads properly oriented.",
    disconnected:
      "No data received from this sensor > 30 s — check placement or battery.",
  },
  thorax: {
    label: "Thorax (RR / EtCO₂)",
    connected: "Respiratory sensor stable; chest excursion normal.",
    disconnected: "Signal interrupted — verifying connection.",
  },
  left_arm: {
    label: "Left Arm (SpO₂ / NIBP / Motion)",
    connected: "Peripheral sensor connected; perfusion index 0.9.",
    disconnected: "Check sensor placement and signal quality.",
  },
  right_arm: {
    label: "Right Arm (SpO₂ / NIBP / Motion)",
    connected: "Peripheral sensor connected.",
    disconnected: "Check sensor placement and signal quality.",
  },
  head: {
    label: "Head band (EEG-lite / EOG / EMG)",
    connected: "Neuro sensor engaged; no signal dropout.",
    disconnected: "Neuro sensor not connected.",
  },
  posture: {
    label: "Posture / IMU / Bed Contact",
    connected: "Patient supine; movement detected.",
    disconnected: "Posture sensor not responding.",
  },
};

// OMO content per COPY.md Box 9
const BODY_DIAGRAM_OMO = {
  observation: "All sensors connected.",
  meaning: "Signals stable across monitored sites.",
  options:
    "Select body region to view signal trend, attachment guidance, or integrity status.",
};

export function BodyDiagramCard({
  alertLevel = "normal",
  onCycleSensorAlert,
  sensors,
  className,
  style,
  onClick,
  isActive,
  unoptimizedImage,
}: {
  alertLevel?: AlertLevel;
  onCycleSensorAlert?: () => void;
  sensors?: SensorInfo[];
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  unoptimizedImage?: boolean;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const sensorStatus = ALERT_LEVEL_TO_STATUS[alertLevel];
  const sensorStyle = SENSOR_STATUS_COLORS[sensorStatus];

  // Get chest sensor info if available
  const chestSensor = sensors?.find((s) => s.location === "chest");
  const chestTooltip =
    chestSensor?.tooltip ??
    (sensorStatus === "disconnected"
      ? SENSOR_TOOLTIPS.chest.disconnected
      : SENSOR_TOOLTIPS.chest.connected);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "bg-transparent border-[#3F6E67]/40 p-0 flex items-center justify-center w-full h-full overflow-hidden",
          onClick &&
            "cursor-pointer hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0",
          isActive &&
            "border-primary/80 shadow-[0_6px_16px_rgba(0,0,0,0.35)] bg-[#d6e8e3]",
          className,
        )}
        style={style}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? (isActive ?? false) : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          suppressHydrationWarning
        >
          <Image
            src="/images/body-diagram.svg"
            alt="Side profile torso with lead locations"
            fill
            priority
            suppressHydrationWarning
            unoptimized={unoptimizedImage}
            style={BODY_DIAGRAM_IMAGE_STYLE}
            sizes="(min-width: 1280px) 240px, (min-width: 1024px) 200px, 100vw"
          />

          {/* Chest Sensor Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-8 h-8 transition-all duration-300",
                  alertLevel === "critical"
                    ? "opacity-100 hover:opacity-80 animate-[pulse_1s_cubic-bezier(0.4,0,_0.6,1)_infinite]"
                    : alertLevel === "warning"
                      ? "opacity-100 hover:opacity-80"
                      : "opacity-60 hover:opacity-100",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onCycleSensorAlert?.();
                }}
                aria-label={`Sensor alert: ${alertLevel}. Click to cycle alert state.`}
                style={{
                  boxShadow: sensorStyle.glow
                    ? `0 0 12px ${sensorStyle.glow}, 0 0 24px ${sensorStyle.glow}`
                    : undefined,
                }}
              >
                {/* Outer hexagon for border */}
                <div
                  className="absolute inset-0 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]"
                  style={{
                    backgroundColor: "rgba(30, 42, 40, 0.6)",
                  }}
                />
                {/* Inner hexagon for fill */}
                <div
                  className="absolute inset-[2px] [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]"
                  style={{ backgroundColor: sensorStyle.fill }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold">
                  {SENSOR_TOOLTIPS.chest.label}
                </div>
                <div className="text-xs">{chestTooltip}</div>
                <div className="text-xs text-muted-foreground">
                  Color reflects sensor status and data trend.
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Status indicator in corner */}
          <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground">
            {alertLevel === "normal"
              ? "All connected"
              : alertLevel === "warning"
                ? "Trend change"
                : "Critical"}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}

// Expanded Body Diagram for modal view
export function BodyDiagramExpandedCard({
  sensors,
  onClose,
}: {
  sensors?: SensorInfo[];
  onClose: () => void;
}) {
  // Default sensors if not provided
  const displaySensors: SensorInfo[] = sensors ?? [
    {
      location: "chest",
      status: "connected",
      signalQuality: 98,
      tooltip: SENSOR_TOOLTIPS.chest.connected,
    },
    {
      location: "thorax",
      status: "connected",
      signalQuality: 95,
      tooltip: SENSOR_TOOLTIPS.thorax.connected,
    },
    {
      location: "left_arm",
      status: "connected",
      signalQuality: 90,
      tooltip: SENSOR_TOOLTIPS.left_arm.connected,
    },
  ];

  return (
    <div
      className="relative w-full max-w-2xl min-h-[60vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Body diagram expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close body diagram"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">
          {BODY_DIAGRAM_OMO.observation}
        </h2>
        <p className="text-base text-[#1e2a28]/80">
          {BODY_DIAGRAM_OMO.meaning}
        </p>
        <p className="text-sm text-[#1e2a28]/60 italic">
          {BODY_DIAGRAM_OMO.options}
        </p>
      </div>

      {/* Body Diagram with Sensors */}
      <div className="flex-1 flex gap-6">
        {/* Diagram */}
        <div className="relative flex-1 min-h-[300px] rounded-xl border border-[#3F6E67]/40 bg-[#9fcac0] overflow-hidden">
          <Image
            src="/images/body-diagram.svg"
            alt="Body diagram with sensor locations"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Sensor List */}
        <div className="w-48 space-y-3">
          <h3 className="font-semibold text-sm">Sensors</h3>
          {displaySensors.map((sensor) => {
            const sensorStyle = SENSOR_STATUS_COLORS[sensor.status];
            const tooltipInfo = SENSOR_TOOLTIPS[sensor.location];

            return (
              <TooltipProvider key={sensor.location}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-3 rounded-lg bg-[#9fcac0] border border-[#3F6E67]/20 cursor-pointer hover:bg-[#8ebdb3] transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sensorStyle.fill }}
                        />
                        <span className="text-xs font-medium capitalize">
                          {sensor.location.replace("_", " ")}
                        </span>
                      </div>
                      {sensor.signalQuality !== undefined && (
                        <div className="text-[10px] text-[#1e2a28]/60">
                          Signal: {sensor.signalQuality}%
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-semibold">{tooltipInfo.label}</div>
                      <div className="text-xs">
                        {sensor.tooltip ?? tooltipInfo.connected}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs font-medium">Chest Pod</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{SENSOR_TOOLTIPS.chest.connected}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Wind className="w-5 h-5" />
                <span className="text-xs font-medium">Thorax</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{SENSOR_TOOLTIPS.thorax.connected}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Activity className="w-5 h-5" />
                <span className="text-xs font-medium">Extremities</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {SENSOR_TOOLTIPS.left_arm.connected}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <PersonStanding className="w-5 h-5" />
                <span className="text-xs font-medium">Posture</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{SENSOR_TOOLTIPS.posture.connected}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
