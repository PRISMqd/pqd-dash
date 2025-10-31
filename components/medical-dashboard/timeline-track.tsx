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
  return (
    <div
      className={cn(
        "rounded relative flex-1 w-full h-[20] bg-[var(--prism-interactive-teal-300)]",
        className,
      )}
      style={style}
    >
      {events.map((event) => (
        <button
          type="button"
          key={event.id}
          onClick={() => onSelectEventAction(event)}
          className={`absolute top-1/2 w-4 h-4 -mt-2 rounded-full ${event.color} border border-accent cursor-pointer hover:scale-125 transition-transform hover:ring-2 hover:ring-ring`}
          style={{ left: event.time }}
          aria-label={`View event at ${event.timestamp}`}
        />
      ))}
    </div>
  );
}
