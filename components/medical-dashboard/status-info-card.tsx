"use client";

import type { CSSProperties } from "react";
import type { StatusPanelContent } from "@/components/medical-dashboard/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function StatusInfoCard({
  content,
  className,
  style,
}: {
  content: StatusPanelContent;
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
        <CardTitle className="text-xs font-semibold">Status:</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed">
        <ScrollArea className="h-full" contentClassName="leading-relaxed">
          <p>{content.summary}</p>
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-2.5 pb-2.5 pt-0">
        {/*<Button className="h-8 w-full bg-primary text-xs text-primary-foreground hover:bg-primary/90">
          {content.actionLabel}
        </Button>*/}
      </CardFooter>
    </Card>
  );
}
