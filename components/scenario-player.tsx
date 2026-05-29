"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Clock } from "lucide-react";
import {
  SEPSIS_RYAN_STAGES,
  SEPSIS_RYAN_META,
  type ScenarioStage,
} from "@/lib/dal/scenario-sepsis-ryan";

type ScenarioPlayerProps = {
  onStageChange: (stage: ScenarioStage) => void;
};

const ALERT_COLORS = {
  normal: { bg: "bg-[#3d7a6e]", text: "text-white", dot: "bg-green-400" },
  warning: { bg: "bg-amber-600", text: "text-white", dot: "bg-amber-300" },
  critical: { bg: "bg-red-700", text: "text-white", dot: "bg-red-300 animate-pulse" },
};

const RISK_BAR_COLOR = (risk: number) => {
  if (risk < 0.3) return "bg-green-500";
  if (risk < 0.6) return "bg-amber-400";
  if (risk < 0.8) return "bg-orange-500";
  return "bg-red-600";
};

export function ScenarioPlayer({ onStageChange }: ScenarioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvanceMs] = useState(4000);

  const currentStage = SEPSIS_RYAN_STAGES[currentIndex];

  const goToStage = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, SEPSIS_RYAN_STAGES.length - 1));
      setCurrentIndex(clamped);
      onStageChange(SEPSIS_RYAN_STAGES[clamped]);
    },
    [onStageChange],
  );

  useEffect(() => {
    onStageChange(SEPSIS_RYAN_STAGES[0]);
  }, [onStageChange]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentIndex >= SEPSIS_RYAN_STAGES.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      goToStage(currentIndex + 1);
    }, autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, autoAdvanceMs, goToStage]);

  const alertColors = ALERT_COLORS[currentStage.alertLevel];

  return (
    <div className={`w-full ${alertColors.bg} ${alertColors.text} px-4 py-2 flex items-center gap-4 transition-colors duration-700`}>
      {/* Scenario label */}
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-2 h-2 rounded-full ${alertColors.dot}`} />
        <span className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap">
          {SEPSIS_RYAN_META.title}
        </span>
      </div>

      {/* Time + PQD State */}
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 opacity-70" />
        <span className="text-sm font-mono font-bold">{currentStage.time}</span>
        <span className="text-xs opacity-80 hidden sm:block">
          {currentStage.pqdState}
        </span>
      </div>

      {/* Risk bar */}
      <div className="flex items-center gap-1.5 flex-1 max-w-32">
        <span className="text-[10px] opacity-70 whitespace-nowrap">Risk</span>
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${RISK_BAR_COLOR(currentStage.pqdRisk)}`}
            style={{ width: `${currentStage.pqdRisk * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold">
          {(currentStage.pqdRisk * 100).toFixed(0)}%
        </span>
      </div>

      {/* Clinical note */}
      <div className="flex-1 min-w-0 hidden md:block">
        <p className="text-xs opacity-80 truncate">{currentStage.clinicalNote}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => goToStage(0)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Reset to start"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => goToStage(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-30"
          title="Previous stage"
        >
          <SkipBack className="w-3.5 h-3.5 rotate-0" />
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="p-1.5 hover:bg-white/20 rounded transition-colors"
          title={isPlaying ? "Pause" : "Play scenario"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => goToStage(currentIndex + 1)}
          disabled={currentIndex === SEPSIS_RYAN_STAGES.length - 1}
          className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-30"
          title="Next stage"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stage indicator dots */}
      <div className="flex items-center gap-1 shrink-0">
        {SEPSIS_RYAN_STAGES.map((stage, i) => (
          <button
            key={stage.time}
            type="button"
            onClick={() => goToStage(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-white scale-125"
                : i < currentIndex
                  ? "bg-white/60"
                  : "bg-white/25"
            }`}
            title={`${stage.time} — ${stage.pqdState}`}
          />
        ))}
      </div>
    </div>
  );
}
