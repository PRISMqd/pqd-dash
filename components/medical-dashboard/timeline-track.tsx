"use client";

import type { CSSProperties } from "react";
import type { TimelineEvent } from "@/components/medical-dashboard/types";
import { cn } from "@/lib/utils";

export function TimelineTrack({
  events,
  onSelectEventAction,
  className,
  style,
}: {
  events: TimelineEvent[];
  onSelectEventAction: (event: TimelineEvent) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const successFill = "#63c77a";
  const successBorder = "#9de39f";
  const criticalFill = "#c22d4d";
  const criticalBorder = "#f5c8d4";

  return (
    <div
      className={cn(
        "rounded-full relative flex-1 w-full h-5 bg-[var(--prism-interactive-teal-300)] overflow-hidden px-2",
        className,
      )}
      style={style}
    >
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
