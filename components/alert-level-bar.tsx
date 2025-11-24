"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { useAlertState } from "@/components/alert-state-context";

interface AlertLevelBarProps {
  level: number; // 0-100, where 100 is full (red/bad) and 0 is empty
  className?: string;
}

export function AlertLevelBar({ level, className = "" }: AlertLevelBarProps) {
  const { isAlert } = useAlertState();
  // Clamp level between 0 and 100
  const clampedLevel = Math.max(0, Math.min(100, level));
  const [fillHeight, setFillHeight] = useState(0);

  useEffect(() => {
    setFillHeight(clampedLevel);
  }, [clampedLevel]);

  return (
    <div
      className={`w-12 rounded-lg overflow-hidden relative bg-(--alert-surface) ${className}`}
      style={
        {
          "--alert-surface": "var(--prism-teal-100)",
        } as CSSProperties
      }
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="relative h-full w-[50px] rounded-lg bg-(--alert-surface)">
          <div
            className="absolute bottom-0 w-full rounded-lg bg-(--alert-fill) motion-safe:transition-[height] motion-safe:duration-500 motion-safe:ease-out"
            style={
              {
                height: `${fillHeight}%`,
                "--alert-fill": isAlert
                  ? "var(--prism-alarm-red)"
                  : "var(--prism-teal-300)",
              } as CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
}
