"use client";

import type { CSSProperties } from "react";
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
}: {
  clinician: ClinicianDetails;
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
