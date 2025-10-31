"use client";

import type { CSSProperties } from "react";
import type { AiInsight } from "@/components/medical-dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AIInformationCard({
  insight,
  className,
  style,
}: {
  insight: AiInsight;
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
          {insight.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed">
        <ScrollArea
          className="h-full"
          contentClassName="space-y-2 leading-relaxed"
        >
          {insight.details.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {insight.recommendations.length > 0 ? (
            <div className="space-y-1 pt-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended Actions
              </div>
              <ul className="space-y-1">
                {insight.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
