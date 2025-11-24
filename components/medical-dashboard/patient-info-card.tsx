"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { PatientDetails } from "@/components/medical-dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PatientInfoCard({
  patient,
  className,
  style,
  onClick,
  isActive,
}: {
  patient: PatientDetails;
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
      <CardContent className="px-2.5 pb-2.5 text-xs space-y-0.5">
        <div>
          <span className="text-primary">Name:</span> {patient.name}
        </div>
        <div>{`${patient.sex} ${patient.birthDate}`}</div>
      </CardContent>
    </Card>
  );
}
