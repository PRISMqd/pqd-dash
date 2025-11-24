"use client";

import type { CSSProperties } from "react";
import type { TimelineEvent } from "@/components/medical-dashboard/types";
import { cn } from "@/lib/utils";

export function TimelineTrack({
  events,
  onSelectEventAction,
  className,
  style,
  tickCount = 10,
  tickColor = "#4fa86d",
}: {
  events: TimelineEvent[];
  onSelectEventAction: (event: TimelineEvent) => void;
  className?: string;
  style?: CSSProperties;
  tickCount?: number;
  tickColor?: string;
}) {
  const successFill = "#63c77a";
  const successBorder = "#9de39f";
  const criticalFill = "#c22d4d";
  const criticalBorder = "#f5c8d4";

  return (
    <div
      className={cn(
        "rounded-full relative flex-1 w-full h-5 bg-[var(--prism-interactive-teal-300)] overflow-hidden",
        className,
      )}
      style={style}
    >
      {[...Array(Math.max(tickCount, 2)).keys()].map((index) => {
        const position = (index / (Math.max(tickCount, 2) - 1)) * 100;
        return (
          <span
            key={`tick-${index}`}
            className="absolute top-1/2 -mt-[7px] w-3.5 h-3.5 rounded-full border-[1.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
            style={{
              left: `${position}%`,
              backgroundColor: tickColor,
              borderColor: tickColor,
            }}
            aria-hidden
          />
        );
      })}
      {events.map((event) => (
        <button
          type="button"
          key={event.id}
          onClick={() => onSelectEventAction(event)}
          className="absolute top-1/2 w-4 h-4 -mt-2 rounded-full cursor-pointer hover:scale-125 transition-transform hover:ring-2 hover:ring-ring z-20"
          style={{
            left: event.time,
            backgroundColor: event.color?.includes("destructive")
              ? criticalFill
              : successFill,
            border: `2px solid ${event.color?.includes("destructive") ? criticalBorder : successBorder}`,
            boxShadow: "0 0 0 2px rgba(0,0,0,0.15)",
          }}
          aria-label={`View event at ${event.timestamp}`}
        />
      ))}
    </div>
  );
}
