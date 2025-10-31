"use client";

import type { CSSProperties } from "react";
import type { PolicyReference } from "@/components/medical-dashboard/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PolicyInfoCard({
  policy,
  className,
  style,
}: {
  policy: PolicyReference;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Card
      className={cn(
        "flex-1 min-h-0 gap-0 py-0 bg-transparent border-[#3F6E67]/40",
        className,
      )}
      style={style}
    >
      <CardHeader className="px-2.5 py-2">
        <CardTitle className="text-xs font-semibold">
          Policy Information:
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2.5 text-xs leading-relaxed">
        <p>{policy.summary}</p>
      </CardContent>
      <CardFooter className="px-2.5 pb-2.5 pt-0"></CardFooter>
    </Card>
  );
}
