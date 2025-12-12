"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { AlertNoteConfig } from "@/components/medical-dashboard/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AlertNotesCard({
  config,
  className,
  style,
  onClick,
  isActive,
  sensorAlertLevel = "normal",
}: {
  config: AlertNoteConfig;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  sensorAlertLevel?: "normal" | "warning" | "critical";
}) {
  const hasBodyAlert = sensorAlertLevel !== "normal";

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
          {hasBodyAlert ? config.details.title : "Notes:"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs">
        <ScrollArea className="h-full" contentClassName="space-y-2">
          {hasBodyAlert ? (
            <AlertDetails
              details={config.details}
              alertLevel={sensorAlertLevel}
            />
          ) : (
            <NotesPlaceholder text={config.notesPlaceholder} />
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-2.5 pb-2.5 pt-0"></CardFooter>
    </Card>
  );
}

function AlertDetails({
  details,
  alertLevel,
}: {
  details: AlertNoteConfig["details"];
  alertLevel: "warning" | "critical";
}) {
  const isWarning = alertLevel === "warning";
  const summaryText = isWarning ? "Active body alert" : details.summary;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full bg-foreground",
            alertLevel === "critical" && "animate-pulse",
          )}
        />
        <span className="text-xs font-semibold">{summaryText}</span>
      </div>
      {details.escalationNote ? (
        <p className="text-xs text-card-foreground leading-relaxed">
          {details.escalationNote}
        </p>
      ) : null}
      <div className="text-xs space-y-0.5 pt-1">
        <div className="text-primary">Location: {details.location}</div>
        <div className="text-primary">Priority: {details.priority}</div>
        <div className="text-primary">Recorded: {details.recordedAt}</div>
      </div>
    </div>
  );
}

function NotesPlaceholder({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground">{text}</p>;
}
