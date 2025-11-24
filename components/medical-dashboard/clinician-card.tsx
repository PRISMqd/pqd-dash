"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { ClinicianDetails } from "@/components/medical-dashboard/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ClinicianCard({
  clinician,
  className,
  style,
  onClick,
  isActive,
}: {
  clinician: ClinicianDetails;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "bg-transparent border-[#3F6E67]/40 min-h-0 gap-0 py-0",
        onClick &&
          "cursor-pointer hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0",
        isActive && "border-primary/80 shadow-[0_6px_16px_rgba(0,0,0,0.35)] bg-[#d6e8e3]",
        className,
      )}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isActive ?? false : undefined}
      aria-expanded={onClick ? (isActive ?? false) : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="px-2.5 py-2">
        <CardTitle className="text-xs font-semibold text-primary">
          Clinician
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2.5 pb-2.5 text-xs space-y-1.5">
        <div className="space-y-0.5">
          <InfoRow label="Name" value={clinician.name} />
          <InfoRow label="Teams" value={clinician.teams.join(", ")} />
          <InfoRow label="Status" value={clinician.status} />
        </div>
        <div className="pt-1.5 space-y-0.5">
          <div className="text-xs font-semibold">Physician</div>
          <div className="text-xs">{clinician.physician}</div>
        </div>
      </CardContent>
      <CardFooter className="px-2.5 pb-2.5 pt-0"></CardFooter>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

export function ClinicianExpandedCard({
  clinician,
  onClose,
}: {
  clinician: ClinicianDetails;
  onClose: () => void;
}) {
  const placeholderKeys = ["notes", "tasks", "history", "handoff"];

  return (
    <div
      className="relative w-full max-w-5xl min-h-[55vh] md:min-h-[60vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Clinician details expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close clinician details"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="space-y-3 md:space-y-4 text-xl md:text-2xl font-semibold">
        <div>Clinician:</div>
        <div>
          <span className="font-bold">Name:</span> {clinician.name}
        </div>
        <div>
          <span className="font-bold">Teams:</span> {clinician.teams.join(", ")}
        </div>
        <div>
          <span className="font-bold">Status:</span> {clinician.status}
        </div>
        <div>
          <span className="font-bold">Physician:</span> {clinician.physician}
        </div>
      </div>

      <div className="flex-1" />

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
        {placeholderKeys.map((placeholder) => (
          <div
            key={placeholder}
            className="h-24 rounded-xl bg-[#7cb7aa] shadow-inner"
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
