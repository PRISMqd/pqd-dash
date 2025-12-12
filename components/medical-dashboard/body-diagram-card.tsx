"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { AlertLevel } from "@/components/alert-state-context";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BODY_DIAGRAM_IMAGE_STYLE: CSSProperties = {
  objectFit: "cover",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
};

const SENSOR_COLORS: Record<AlertLevel, string> = {
  normal: "transparent",
  warning: "var(--dl-warning)",
  critical: "var(--dl-crisis)",
};

export function BodyDiagramCard({
  alertLevel = "normal",
  onCycleSensorAlert,
  className,
  style,
  onClick,
  isActive,
  unoptimizedImage,
}: {
  alertLevel?: AlertLevel;
  onCycleSensorAlert?: () => void;
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

  const sensorColor = SENSOR_COLORS[alertLevel];

  return (
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
        <button
          type="button"
          className={cn(
            "absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-8 h-8 transition-all duration-300",
            alertLevel === "critical"
              ? "opacity-100 hover:opacity-80 animate-[pulse_1s_cubic-bezier(0.4,0,_0.6,1)_infinite]"
              : alertLevel === "warning"
                ? "opacity-100 hover:opacity-80"
                : "opacity-0 hover:opacity-30",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onCycleSensorAlert?.();
          }}
          aria-label={`Sensor alert: ${alertLevel}. Click to cycle alert state.`}
        >
          {/* Outer hexagon for border */}
          <div
            className="absolute inset-0 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]"
            style={{
              backgroundColor:
                alertLevel !== "normal" ? "rgba(30, 42, 40, 0.6)" : "#3F6E67",
            }}
          />
          {/* Inner hexagon for fill */}
          <div
            className="absolute inset-[2px] [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]"
            style={{ backgroundColor: sensorColor }}
          />
        </button>
      </div>
    </Card>
  );
}
