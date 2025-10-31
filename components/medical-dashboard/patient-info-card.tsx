"use client";

import type { CSSProperties } from "react";
import type { PatientDetails } from "@/components/medical-dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PatientInfoCard({
  patient,
  className,
  style,
}: {
  patient: PatientDetails;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Card
      className={cn(
        "bg-transparent border-[#3F6E67]/40 min-h-0 gap-0 py-0",
        className,
      )}
      style={style}
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
