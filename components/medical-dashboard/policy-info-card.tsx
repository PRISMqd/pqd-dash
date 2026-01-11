"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { PolicyReference } from "@/components/medical-dashboard/types";
import { BarChart3, BookOpen, FileText, Globe, X } from "lucide-react";
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

// Policy trigger type to display text mapping per COPY.md Box 5
const POLICY_TRIGGER_LABELS: Record<
  string,
  { title: string; reference: string }
> = {
  sepsis: {
    title: "Early Sepsis Screening and Rapid Response Activation Criteria",
    reference: "Surviving Sepsis Campaign. Crit Care Med. 2021;49(6):933–941.",
  },
  opioid: {
    title: "Opioid Safety and Sedation Monitoring Policy",
    reference: "Anesth Analg. 2022;135(2):321–329.",
  },
  delirium: {
    title: "Delirium Prevention and De-escalation Protocol",
    reference: "ICU Delirium & Cognitive Impairment Study Group, 2020.",
  },
  skin_integrity: {
    title: "Repositioning and Pressure Injury Prevention Guidelines",
    reference: "NPUAP Clinical Practice Guidelines, 2019.",
  },
  alarm_fatigue: {
    title: "Safe Alarm Management Policy",
    reference: "AHRQ Alarm Fatigue Reduction Toolkit, 2021.",
  },
  general: {
    title: "WHO Patient Safety Framework",
    reference: "World Health Organization, 2022.",
  },
};

// Color/state logic per COPY.md Box 5
const POLICY_STATE_STYLES: Record<
  "neutral" | "context" | "critical",
  { border: string; accent?: string }
> = {
  neutral: {
    border: "border-[#4B90A6]/40",
  },
  context: {
    border: "border-[#D1C247]",
    accent: "bg-[#D1C247]/10",
  },
  critical: {
    border: "border-[#C22D4D]",
  },
};

export function PolicyInfoCard({
  policy,
  className,
  style,
  onClick,
  isActive,
}: {
  policy: PolicyReference;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const { isAlert, alertLevel } = useAlertState();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  // Determine policy state based on trigger type and alert level
  const getPolicyState = (): "neutral" | "context" | "critical" => {
    if (isAlert || alertLevel === "critical") {
      if (policy.triggerType === "sepsis" || policy.triggerType === "opioid") {
        return "critical";
      }
      return "context";
    }
    if (policy.triggerType && policy.triggerType !== "general") {
      return "context";
    }
    return "neutral";
  };

  const policyState = getPolicyState();
  const stateStyle = POLICY_STATE_STYLES[policyState];

  // OMO content
  const observation =
    policy.omo?.observation ?? "Policy and reference links available.";
  const meaning =
    policy.omo?.meaning ??
    "Guidance is drawn from current institutional protocols and international best practices.";
  const options =
    policy.omo?.options ??
    "Select to view applicable policy, evidence summary, or quick reference card.";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "flex-1 min-h-0 gap-0 py-0 bg-transparent",
              stateStyle.border,
              stateStyle.accent,
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
              <CardTitle className="text-xs font-semibold">
                Policy Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed">
              <ScrollArea
                className="h-full"
                contentClassName="leading-relaxed space-y-2"
              >
                {/* OMO Structure */}
                <p className="font-medium">{observation}</p>
                <p className="text-[10px] text-muted-foreground">{meaning}</p>

                {/* Policy Summary */}
                <div className="pt-2 border-t border-current/10">
                  <p>{policy.summary}</p>
                </div>

                {/* Evidence Reference */}
                {policy.citation && (
                  <div className="pt-1 text-[10px] text-muted-foreground italic">
                    {policy.citation}
                  </div>
                )}
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

// Expanded Policy Card for modal view
export function PolicyExpandedCard({
  policy,
  onClose,
}: {
  policy: PolicyReference;
  onClose: () => void;
}) {
  const triggerInfo = policy.triggerType
    ? POLICY_TRIGGER_LABELS[policy.triggerType]
    : POLICY_TRIGGER_LABELS.general;

  return (
    <div
      className="relative w-full max-w-4xl min-h-[50vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Policy information expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close policy information"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">
          {policy.omo?.observation ?? "Policy and reference links available."}
        </h2>
        <p className="text-base text-[#1e2a28]/80">
          {policy.omo?.meaning ??
            "Guidance is drawn from current institutional protocols and international best practices."}
        </p>
      </div>

      {/* Policy Content */}
      <div className="space-y-4 mb-6 p-4 rounded-xl bg-[#9fcac0]">
        <h3 className="font-semibold">{triggerInfo.title}</h3>
        <p className="text-base leading-relaxed">{policy.summary}</p>
        {policy.citation && (
          <p className="text-sm text-[#1e2a28]/70 italic">{policy.citation}</p>
        )}
      </div>

      {/* Evidence Summary */}
      {policy.evidenceSummary && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Evidence Summary</h3>
          <p className="text-sm">{policy.evidenceSummary}</p>
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
                <span className="text-sm font-medium">Policy View</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              View institution's rapid-response activation criteria.
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
                <Globe className="w-6 h-6" />
                <span className="text-sm font-medium">Reference</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              See summarized evidence supporting this alert.
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
                <BookOpen className="w-6 h-6" />
                <span className="text-sm font-medium">Quick Reference</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Review quick guide for bedside actions and escalation pathways.
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
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm font-medium">Insights</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              View unit compliance and outcomes for this protocol.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
