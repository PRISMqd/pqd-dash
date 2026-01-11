"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type {
  AiInsight,
  AlertLevel,
} from "@/components/medical-dashboard/types";
import { FileText, Link, MessageSquare, TrendingUp, X } from "lucide-react";
import { useAlertState } from "@/components/alert-state-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Alert state visual styles per COPY.md Box 4
const ALERT_STATE_STYLES: Record<
  AlertLevel,
  { border: string; bg: string; pulse?: boolean }
> = {
  normal: {
    border: "border-[#218F67]/40",
    bg: "bg-[#218F67]/5",
  },
  warning: {
    border: "border-[#D1C247]",
    bg: "bg-[#D1C247]/10",
    pulse: true,
  },
  critical: {
    border: "border-[#C22D4D]",
    bg: "bg-[#C22D4D]/10",
  },
};

export function AIInformationCard({
  insight,
  className,
  style,
  onClick,
  isActive,
  alertLevel: propAlertLevel,
}: {
  insight: AiInsight;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  alertLevel?: AlertLevel;
}) {
  const { isAlert, alertLevel: contextAlertLevel } = useAlertState();
  const alertLevel =
    propAlertLevel ?? (isAlert ? "critical" : (contextAlertLevel ?? "normal"));
  const stateStyle = ALERT_STATE_STYLES[alertLevel];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  // Determine OMO content based on alert state
  const hasActiveAlert = alertLevel !== "normal";
  const observation = hasActiveAlert
    ? (insight.omo?.observation ?? insight.details[0])
    : (insight.omo?.observation ?? "No active alerts.");
  const meaning = hasActiveAlert
    ? (insight.omo?.meaning ??
      "Review trend detail or initiate safety check-in.")
    : (insight.omo?.meaning ??
      "All monitored parameters within expected range.");
  const options =
    insight.omo?.options ??
    "Review recent trend history or verify sensor placement.";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "flex-1 min-h-0 gap-0 py-0 bg-transparent",
              stateStyle.border,
              stateStyle.bg,
              stateStyle.pulse && "animate-pulse-slow",
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
            <CardHeader className="px-2.5 py-2">
              <div className="flex items-center gap-2">
                {alertLevel !== "normal" && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      alertLevel === "critical"
                        ? "bg-[#C22D4D]"
                        : "bg-[#D1C247]",
                      alertLevel === "warning" && "animate-pulse",
                    )}
                    aria-hidden="true"
                  />
                )}
                <CardTitle className="text-xs font-semibold">
                  {insight.headline}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed">
              <ScrollArea
                className="h-full"
                contentClassName="space-y-2 leading-relaxed"
              >
                {/* OMO Structure */}
                <div className="space-y-2">
                  <p className="font-medium">{observation}</p>
                  <p className="text-muted-foreground text-[10px]">{meaning}</p>
                </div>

                {/* Details */}
                {insight.details
                  .slice(hasActiveAlert ? 1 : 0)
                  .map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                {/* Recommendations */}
                {insight.recommendations.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggested Actions
                    </div>
                    <ul className="space-y-1">
                      {insight.recommendations.map((recommendation) => (
                        <li key={recommendation} className="text-[10px]">
                          • {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </ScrollArea>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs text-left">
          <div className="space-y-1">
            <div className="font-semibold">Options</div>
            <div className="text-xs">{options}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Expanded AI Information Card for modal view
export function AIInformationExpandedCard({
  insight,
  onClose,
  alertLevel = "normal",
}: {
  insight: AiInsight;
  onClose: () => void;
  alertLevel?: AlertLevel;
}) {
  const hasActiveAlert = alertLevel !== "normal";

  return (
    <div
      className="relative w-full max-w-4xl min-h-[50vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Information panel expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close information panel"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          {hasActiveAlert && (
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                alertLevel === "critical" ? "bg-[#C22D4D]" : "bg-[#D1C247]",
              )}
            />
          )}
          <h2 className="text-xl font-semibold">{insight.headline}</h2>
        </div>

        <div className="text-lg">
          {insight.omo?.observation ??
            (hasActiveAlert ? insight.details[0] : "No active alerts.")}
        </div>
        <div className="text-base text-[#1e2a28]/80">
          {insight.omo?.meaning ??
            "All monitored parameters within expected range."}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        {insight.details.map((detail) => (
          <p key={detail} className="text-base leading-relaxed">
            {detail}
          </p>
        ))}
      </div>

      {/* Recommendations */}
      {insight.recommendations.length > 0 && (
        <div className="space-y-2 mb-6 p-4 rounded-xl bg-[#9fcac0]">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            Suggested Actions
          </h3>
          <ul className="space-y-2">
            {insight.recommendations.map((rec) => (
              <li key={rec} className="flex items-start gap-2">
                <span className="text-[#218F67] mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-20 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium">Expand Alert</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              View detailed trend and contributing signals.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-20 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm font-medium">Open Trend</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              View short-term and baseline comparison.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-20 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm font-medium">Add Note</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Document your observation or response.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-20 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
              >
                <Link className="w-6 h-6" />
                <span className="text-sm font-medium">Link Policy</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Access relevant protocol or evidence reference.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
