"use client";

import type {
  AlertLevel,
  VitalSignTooltip,
} from "@/components/medical-dashboard/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PANEL_TRANSITION_CLASS =
  "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out";
const COLOR_TRANSITION_CLASS =
  "motion-safe:transition-colors motion-safe:duration-500 motion-safe:ease-out";

// Vital sign tooltips per COPY.md Box 2
const VITAL_SIGN_TOOLTIPS: Record<string, VitalSignTooltip> = {
  HR: {
    standard: "Heart rate steady from baseline.",
    high: "HR > 130 bpm may indicate pain, fever, hypovolemia, or shock — consider assessment.",
    low: "HR < 50 bpm may reflect sedation, drug effect, or block — verify perfusion.",
  },
  RR: {
    standard: "Respiratory rate within normal range.",
    high: "RR > 22 sustained may signal early deterioration.",
    low: "RR < 8 may indicate opioid depression — check airway and alert team.",
  },
  SpO2: {
    standard: "SpO₂ with stable trend.",
    high: "SpO₂ < 91% or rapid drop > 3 pts — evaluate airway and perfusion.",
  },
  Temp: {
    standard: "Temperature within expected range.",
    high: "Temp ≥ 100.4°F may suggest infection or inflammation.",
    low: "Temp ≤ 96.8°F may reflect hypothermia or shock — warm and re-evaluate.",
  },
  BP: {
    standard: "Blood pressure stable.",
    high: "SBP > 180 or MAP > 110 — evaluate pain, anxiety, or hypertension.",
    low: "SBP < 90 or MAP < 65 — possible hypoperfusion — review fluids and trend.",
  },
  EtCO2: {
    standard: "EtCO₂ normal ventilation.",
    high: "EtCO₂ > 50 mmHg may indicate hypoventilation or equipment obstruction.",
    low: "EtCO₂ < 30 mmHg may reflect hyperventilation or shock.",
  },
  SV: {
    standard: "Stroke volume within normal range.",
  },
  PQD: {
    standard: "PQD Risk within safe range.",
    high: "PQD Risk ≥ 0.8 → high probability of deterioration — review trends and alert team.",
  },
};

// Color rules per COPY.md Box 2
const ALERT_LEVEL_STYLES: Record<
  AlertLevel,
  { text: string; animation?: string }
> = {
  normal: { text: "text-foreground" },
  warning: { text: "text-[#D1C247]", animation: "animate-pulse-slow" },
  critical: { text: "text-destructive" },
};

export type VitalSignProps = {
  label: string;
  value: string;
  subValue?: string;
  avg: string;
  alert?: boolean;
  alertLevel?: AlertLevel;
  large?: boolean;
  glowColor?: string;
  glowBlur?: number;
  unit?: string;
};

export function VitalSign({
  label,
  value,
  subValue,
  avg,
  alert,
  alertLevel = "normal",
  large,
  glowColor,
  glowBlur = 14,
  unit,
}: VitalSignProps) {
  const glowStyle = glowColor
    ? {
        textShadow: `0 0 ${glowBlur}px ${glowColor}, 0 0 ${glowBlur * 0.6}px ${glowColor}`,
      }
    : undefined;

  const tooltipKey = label.replace("₂", "2").toUpperCase();
  const tooltip = VITAL_SIGN_TOOLTIPS[tooltipKey];
  const levelStyle = ALERT_LEVEL_STYLES[alertLevel];

  const getTooltipContent = () => {
    if (!tooltip) return null;

    if (alertLevel === "critical" && tooltip.high) {
      return tooltip.high;
    }
    if (alertLevel === "warning" && tooltip.low) {
      return tooltip.low;
    }
    return `${label} ${value}${unit ? ` ${unit}` : ""}, ${tooltip.standard}`;
  };

  const tooltipContent = getTooltipContent();

  const vitalContent = (
    <div
      className={cn(
        "flex flex-col justify-between px-2 py-2",
        PANEL_TRANSITION_CLASS,
        levelStyle.animation,
      )}
    >
      <div
        className={cn(
          "h-5 flex items-center justify-center",
          COLOR_TRANSITION_CLASS,
        )}
      >
        <div className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {label}
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          large ? "h-20" : "h-16",
          PANEL_TRANSITION_CLASS,
        )}
      >
        <div
          className={cn(
            large ? "text-5xl" : "text-3xl",
            "font-bold tracking-tight leading-none whitespace-nowrap",
            alert ? "text-destructive" : levelStyle.text,
            COLOR_TRANSITION_CLASS,
          )}
          style={glowStyle}
        >
          {value}
        </div>
        {subValue && (
          <div
            className={cn(
              "text-xl font-bold text-foreground/90 leading-none mt-1 whitespace-nowrap",
              COLOR_TRANSITION_CLASS,
            )}
          >
            {subValue}
          </div>
        )}
      </div>
      <div
        className={cn(
          "h-5 flex items-center justify-center",
          COLOR_TRANSITION_CLASS,
        )}
      >
        <div className="text-xs font-bold text-muted-foreground/70 whitespace-nowrap">
          AVG {avg}
        </div>
      </div>
    </div>
  );

  if (!tooltipContent) {
    return vitalContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{vitalContent}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-left">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// PQD Risk display component
export function PQDRiskDisplay({
  value,
  alertLevel = "normal",
}: {
  value: number;
  alertLevel?: AlertLevel;
}) {
  const tooltip = VITAL_SIGN_TOOLTIPS.PQD;
  const levelStyle = ALERT_LEVEL_STYLES[alertLevel];

  const getTooltipContent = () => {
    if (value >= 0.8 && tooltip.high) {
      return tooltip.high;
    }
    return `PQD Risk ${value.toFixed(2)} — ${tooltip.standard}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex flex-col justify-between px-2 py-2 cursor-help",
              PANEL_TRANSITION_CLASS,
              levelStyle.animation,
            )}
          >
            <div
              className={cn(
                "h-5 flex items-center justify-center",
                COLOR_TRANSITION_CLASS,
              )}
            >
              <div className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                PQD Risk
              </div>
            </div>
            <div
              className={cn(
                "flex flex-col items-center justify-center h-16",
                PANEL_TRANSITION_CLASS,
              )}
            >
              <div
                className={cn(
                  "text-3xl font-bold tracking-tight leading-none whitespace-nowrap",
                  levelStyle.text,
                  COLOR_TRANSITION_CLASS,
                )}
              >
                {value.toFixed(2)}
              </div>
            </div>
            <div
              className={cn(
                "h-5 flex items-center justify-center",
                COLOR_TRANSITION_CLASS,
              )}
            >
              <div className="text-xs font-bold text-muted-foreground/70 whitespace-nowrap">
                TREND ↔
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-left">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
