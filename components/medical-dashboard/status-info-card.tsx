"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { StatusPanelContent } from "@/components/medical-dashboard/types";
import { Clock, Pencil, RefreshCw, X } from "lucide-react";
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

// Adaptive text states per COPY.md Box 3
const STATUS_PATTERNS = {
  resting: {
    observation: "Patient is resting.",
    meaning: "Movement minimal • Vitals stable • Monitoring active.",
  },
  active: {
    observation: "Patient appears active.",
    meaning: "Vitals responding to movement.",
  },
  movement_with_respiratory: {
    observation: "Movement detected with respiratory change.",
    meaning: "Observe for discomfort or pain.",
  },
  prolonged_inactivity: {
    observation: "No movement detected for > 2 h.",
    meaning: "Consider repositioning if appropriate.",
  },
  procedure: {
    observation: "Procedure in progress.",
    meaning: "Monitoring continuous.",
  },
  signal_loss: {
    observation: "Signal interrupted.",
    meaning: "Verifying connection.",
  },
} as const;

export function StatusInfoCard({
  content,
  className,
  style,
  onClick,
  isActive,
  maxContentHeight,
  minContentHeight,
}: {
  content: StatusPanelContent;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  maxContentHeight?: string | number;
  minContentHeight?: string | number;
}) {
  const { isAlert, alertLevel } = useAlertState();
  const alertActive = isAlert;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const levelColors: Record<
    string,
    { bg: string; border: string; text: string; animation?: string }
  > = {
    normal: {
      bg: "var(--dl-accent-neutral)",
      border: "var(--dl-stable)",
      text: "var(--dl-text-primary)",
    },
    warning: {
      bg: "var(--dl-warning)",
      border: "#928523",
      text: "var(--dl-text-primary)",
      animation: "animate-border-pulse-amber",
    },
    critical: {
      bg: "var(--dl-crisis)",
      border: "#8d1f3b",
      text: "var(--prism-alarm-red-foreground)",
    },
  };

  const level = alertActive ? "critical" : (alertLevel ?? "normal");
  const { bg, border, text, animation } =
    levelColors[level] ?? levelColors.normal;

  // Get OMO content from props or use pattern-based content
  const patternKey = content.detectedPattern ?? "resting";
  const pattern = STATUS_PATTERNS[patternKey];
  const observation = content.omo?.observation ?? pattern.observation;
  const meaning = content.omo?.meaning ?? pattern.meaning;
  const options =
    content.omo?.options ??
    "Select to annotate activity, update status, or add observation note.";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "flex-1 min-h-0 gap-0 py-0 text-foreground",
              onClick &&
                "cursor-pointer hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0",
              isActive && "shadow-[0_6px_16px_rgba(0,0,0,0.35)]",
              animation,
              className,
            )}
            style={{
              ...style,
              color: text,
              borderColor: border,
              backgroundColor: bg,
            }}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-pressed={onClick ? (isActive ?? false) : undefined}
            onClick={onClick}
            onKeyDown={handleKeyDown}
          >
            <CardHeader className="px-2.5 py-2 text-current">
              <CardTitle
                className="text-xs font-semibold"
                style={{ color: text }}
              >
                Status
              </CardTitle>
            </CardHeader>
            <CardContent
              className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed"
              style={{ color: text }}
            >
              <ScrollArea
                className="w-full"
                style={{
                  minHeight: minContentHeight ?? "3.5rem",
                  maxHeight: maxContentHeight ?? "8rem",
                }}
                contentClassName="leading-relaxed text-current p-0"
              >
                <div className="space-y-1">
                  <p className="font-medium" style={{ color: text }}>
                    {observation}
                  </p>
                  <p className="text-[10px] opacity-80" style={{ color: text }}>
                    {meaning}
                  </p>
                </div>
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

// Expanded status card for modal view
export function StatusExpandedCard({
  content,
  onClose,
}: {
  content: StatusPanelContent;
  onClose: () => void;
}) {
  const patternKey = content.detectedPattern ?? "resting";
  const pattern = STATUS_PATTERNS[patternKey];

  return (
    <div
      className="relative w-full max-w-3xl min-h-[45vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Status details expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close status details"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-4 mb-6">
        <div className="text-xl font-semibold">
          {content.omo?.observation ?? pattern.observation}
        </div>
        <div className="text-base text-[#1e2a28]/80">
          {content.omo?.meaning ?? pattern.meaning}
        </div>
        <div className="text-sm text-[#1e2a28]/70 italic">
          {content.omo?.options ??
            "Select to annotate activity, update status, or add observation note."}
        </div>
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-20 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
              >
                <Pencil className="w-5 h-5" />
                <span className="text-sm font-medium">Annotate Status</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Record observed activity (e.g., sleeping, eating, ambulating).
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
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Timeline View</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              View past 4-hour status and physiologic stability.
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
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium">Auto-Status</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle automatic activity detection from sensors.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
