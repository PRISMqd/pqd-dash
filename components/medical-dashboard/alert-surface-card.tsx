"use client";

import type { ComponentProps } from "react";
import { useAlertState } from "@/components/alert-state-context";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AlertSurfaceCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const { isAlert } = useAlertState();

  return (
    <Card
      className={cn(
        isAlert
          ? "bg-medical-red-card text-white border-medical-red-border shadow-lg shadow-red-950/30"
          : "bg-transparent border-[#3F6E67]/40",
        "min-h-0 gap-0 py-0 transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}
