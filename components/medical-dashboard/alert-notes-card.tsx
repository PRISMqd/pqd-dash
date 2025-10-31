"use client";

import type { CSSProperties } from "react";
import type { AlertNoteConfig } from "@/components/medical-dashboard/types";
import { useAlertState } from "@/components/alert-state-context";
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
}: {
  config: AlertNoteConfig;
  className?: string;
  style?: CSSProperties;
}) {
  const { isAlert } = useAlertState();
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
          {isAlert ? config.details.title : "Notes:"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs">
        <ScrollArea className="h-full" contentClassName="space-y-2">
          {isAlert ? (
            <AlertDetails details={config.details} />
          ) : (
            <NotesPlaceholder text={config.notesPlaceholder} />
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-2.5 pb-2.5 pt-0"></CardFooter>
    </Card>
  );
}

function AlertDetails({ details }: { details: AlertNoteConfig["details"] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-semibold text-destructive">
          {details.summary}
        </span>
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
