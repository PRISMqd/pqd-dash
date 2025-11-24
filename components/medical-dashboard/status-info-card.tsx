"use client";

import type { CSSProperties, KeyboardEvent } from "react";
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
  onClick,
  isActive,
}: {
  content: StatusPanelContent;
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
        "flex-1 min-h-0 gap-0 py-0 bg-transparent border-[#3F6E67]/40",
        onClick &&
          "cursor-pointer hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0",
        isActive && "border-primary/80 shadow-[0_6px_16px_rgba(0,0,0,0.35)] bg-[#d6e8e3]",
        className,
      )}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isActive ?? false : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
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
