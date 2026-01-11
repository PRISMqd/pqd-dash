"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { PatientDetails } from "@/components/medical-dashboard/types";
import {
  AlertTriangle,
  ClipboardList,
  Footprints,
  PersonStanding,
  Pill,
  ShieldAlert,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Verification state colors per COPY.md Box 8
const VERIFICATION_STYLES = {
  verified: { border: "border-[#218F67]", label: "Verified this shift" },
  pending: {
    border: "border-[#D1C247] animate-border-pulse-amber",
    label: "Pending verification",
  },
  unknown: {
    border: "border-[#C22D4D]",
    label: "Unknown or unclear - verify immediately",
  },
} as const;

export function PatientInfoCard({
  patient,
  className,
  style,
  onClick,
  isActive,
  verificationStatus = "verified",
}: {
  patient: PatientDetails;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  verificationStatus?: "verified" | "pending" | "unknown";
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const verifyStyle = VERIFICATION_STYLES[verificationStatus];

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const parts = birthDate.split("/");
    if (parts.length === 3) {
      const year = Number.parseInt(parts[2], 10);
      const fullYear =
        year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
      const currentYear = new Date().getFullYear();
      return currentYear - fullYear;
    }
    return null;
  };

  const age = calculateAge(patient.birthDate);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "bg-transparent min-h-0 gap-0 py-0",
          verifyStyle.border,
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
          <CardTitle className="text-xs font-semibold text-primary">
            Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2.5 pb-2.5 text-xs space-y-1.5">
          {/* Patient Identification */}
          <div className="space-y-0.5">
            <div className="font-semibold text-sm">{patient.name}</div>
            <div className="text-muted-foreground">
              {patient.sex} {age ? `Age ${age}` : patient.birthDate}
              {patient.room && ` • Room ${patient.room}`}
            </div>
          </div>

          {/* Safety Designations */}
          <div className="flex flex-wrap gap-1 pt-1">
            {/* Code Status */}
            {patient.codeStatus && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-medium",
                      patient.codeStatus === "Full"
                        ? "bg-[#218F67]/20 text-[#218F67]"
                        : patient.codeStatus === "DNR"
                          ? "bg-[#C22D4D]/20 text-[#C22D4D]"
                          : "bg-[#D1C247]/20 text-[#7B6645]",
                    )}
                  >
                    {patient.codeStatus}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Displays current resuscitation order from chart. If unclear,
                  verify with team lead.
                </TooltipContent>
              </Tooltip>
            )}

            {/* Isolation */}
            {patient.isolation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#D1C247]/20 text-[#7B6645] inline-flex items-center gap-0.5">
                    <ShieldAlert className="w-3 h-3" />{" "}
                    {patient.isolation.split(" ")[0]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {patient.isolation} — use appropriate PPE.
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fall Risk */}
            {patient.fallRisk && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#C22D4D]/20 text-[#C22D4D] inline-flex items-center gap-0.5">
                    <Footprints className="w-3 h-3" /> Fall Risk
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Fall-risk identified — ensure call light and assistive devices
                  within reach.
                </TooltipContent>
              </Tooltip>
            )}

            {/* Allergies indicator */}
            {patient.allergies && patient.allergies.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#C22D4D]/20 text-[#C22D4D] inline-flex items-center gap-0.5">
                    <Pill className="w-3 h-3" /> Allergies
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-semibold">Allergies & Alerts</div>
                    <div className="text-xs">
                      {patient.allergies.join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Verify before administration.
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Expanded Patient Card for modal view
export function PatientExpandedCard({
  patient,
  onClose,
  verificationStatus = "verified",
}: {
  patient: PatientDetails;
  onClose: () => void;
  verificationStatus?: "verified" | "pending" | "unknown";
}) {
  const verifyStyle = VERIFICATION_STYLES[verificationStatus];

  return (
    <div
      className={cn(
        "relative w-full max-w-3xl min-h-[50vh] rounded-2xl border-2 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col",
        verifyStyle.border,
      )}
      role="dialog"
      aria-label="Patient information expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close patient information"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">
          {patient.omo?.observation ??
            `Patient: ${patient.name} ${patient.room ? `Room ${patient.room}` : ""}`}
        </h2>
        <p className="text-base text-[#1e2a28]/80">
          {patient.omo?.meaning ??
            `${patient.codeStatus ?? "Code status pending"}; ${patient.isolation ?? "No isolation"}${patient.fallRisk ? "; fall-risk band applied" : ""}.`}
        </p>
      </div>

      {/* Patient Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Identification */}
        <div className="p-4 rounded-xl bg-[#9fcac0]">
          <h3 className="font-semibold mb-2">Identification</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Name:</span> {patient.name}
            </div>
            <div>
              <span className="font-medium">Sex:</span> {patient.sex}
            </div>
            <div>
              <span className="font-medium">DOB:</span> {patient.birthDate}
            </div>
            {patient.room && (
              <div>
                <span className="font-medium">Room:</span> {patient.room}
              </div>
            )}
          </div>
        </div>

        {/* Code Status & Directives */}
        <div className="p-4 rounded-xl bg-[#9fcac0]">
          <h3 className="font-semibold mb-2">Directives</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Code Status:</span>{" "}
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  patient.codeStatus === "Full"
                    ? "bg-[#218F67]/20 text-[#218F67]"
                    : patient.codeStatus === "DNR"
                      ? "bg-[#C22D4D]/20 text-[#C22D4D]"
                      : "bg-[#D1C247]/20 text-[#7B6645]",
                )}
              >
                {patient.codeStatus ?? "Verify"}
              </span>
            </div>
            {patient.isolation && (
              <div>
                <span className="font-medium">Isolation:</span>{" "}
                {patient.isolation}
              </div>
            )}
          </div>
        </div>

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="p-4 rounded-xl bg-[#C22D4D]/10 border border-[#C22D4D]/30">
            <h3 className="font-semibold mb-2 text-[#C22D4D]">
              Allergies & Alerts
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="px-2 py-1 rounded bg-[#C22D4D]/20 text-[#C22D4D] text-sm font-medium"
                >
                  {allergy}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#1e2a28]/70">
              Verify before administration.
            </p>
          </div>
        )}

        {/* Mobility & Activity */}
        <div className="p-4 rounded-xl bg-[#9fcac0]">
          <h3 className="font-semibold mb-2">Mobility & Activity</h3>
          <div className="space-y-1 text-sm">
            {patient.mobilityStatus && (
              <div>
                <span className="font-medium">Mobility:</span>{" "}
                {patient.mobilityStatus}
              </div>
            )}
            {patient.fallRisk && (
              <div className="text-[#C22D4D] font-medium inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Fall Risk — ensure call
                light and assistive devices within reach
              </div>
            )}
          </div>
        </div>

        {/* Diet & Fluids */}
        {(patient.dietOrders || patient.fluidRestriction) && (
          <div className="p-4 rounded-xl bg-[#9fcac0]">
            <h3 className="font-semibold mb-2">Diet & Fluids</h3>
            <div className="space-y-1 text-sm">
              {patient.dietOrders && (
                <div>
                  <span className="font-medium">Diet:</span>{" "}
                  {patient.dietOrders}
                </div>
              )}
              {patient.fluidRestriction && (
                <div>
                  <span className="font-medium">Fluids:</span>{" "}
                  {patient.fluidRestriction}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-xs font-medium">Directives</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Review advance directives and resuscitation preferences.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Pill className="w-5 h-5" />
                <span className="text-xs font-medium">Allergies</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Contains documented sensitivities. Verify before administration.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <PersonStanding className="w-5 h-5" />
                <span className="text-xs font-medium">Mobility</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Indicates current mobility order and assist level.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span className="text-xs font-medium">Diet</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Summarizes diet restrictions and fluid orders.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-xs font-medium">Shift Summary</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Read latest handoff notes for continuity.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
