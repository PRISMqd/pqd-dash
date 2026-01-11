"use client";

import type { CSSProperties } from "react";
import type { TimelineEvent } from "@/components/medical-dashboard/types";
import { Bookmark, Check, Compass, Pencil, Tag } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function TimelineTrack({
  events,
  onSelectEventAction,
  onAddNote,
  onTagEvent,
  className,
  style,
}: {
  events: TimelineEvent[];
  onSelectEventAction: (event: TimelineEvent) => void;
  onAddNote?: () => void;
  onTagEvent?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "pending" | "saved">(
    "idle",
  );

  const successFill = "#63c77a";
  const successBorder = "#9de39f";
  const criticalFill = "#c22d4d";
  const criticalBorder = "#f5c8d4";

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    setSaveState("pending");
    // Simulate save
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
        setNoteText("");
        setIsNoteInputOpen(false);
      }, 1000);
    }, 500);
    onAddNote?.();
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-2", className)} style={style}>
        {/* Timeline Track */}
        <div className="flex items-center gap-2">
          {/* Add Note Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  "bg-[var(--prism-interactive-teal-200)] hover:bg-[var(--prism-interactive-teal-100)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isNoteInputOpen && "bg-[var(--prism-interactive-teal-100)]",
                )}
                aria-label="Add note"
                aria-expanded={isNoteInputOpen}
              >
                <Pencil className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Add Note</div>
                <div className="text-xs">
                  Record what you see or do. Notes appear on the timeline and
                  handoff summary.
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Tag Event Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onTagEvent}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  "bg-[var(--prism-interactive-teal-200)] hover:bg-[var(--prism-interactive-teal-100)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
                aria-label="Tag event"
              >
                <Tag className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Tag Event</div>
                <div className="text-xs">
                  Mark an intervention or change (e.g., medication, reposition,
                  call placed).
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Timeline Events */}
          <div className="rounded-full flex items-center justify-between gap-1 flex-1 h-5 bg-[var(--prism-interactive-teal-300)] overflow-hidden px-3">
            {events.map((event) => (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectEventAction(event)}
                    className="w-4 h-4 rounded-full cursor-pointer hover:scale-125 transition-transform hover:ring-2 hover:ring-ring"
                    style={{
                      backgroundColor: event.color?.includes("destructive")
                        ? criticalFill
                        : successFill,
                      border: `2px solid ${event.color?.includes("destructive") ? criticalBorder : successBorder}`,
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.15)",
                    }}
                    aria-label={`View event at ${event.timestamp}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-semibold">{event.type}</div>
                    <div className="text-xs">{event.timestamp}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.description}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Bookmark Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  "bg-[var(--prism-interactive-teal-200)] hover:bg-[var(--prism-interactive-teal-100)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
                aria-label="Bookmark this time point"
              >
                <Bookmark className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Bookmark</div>
                <div className="text-xs">
                  Place a marker to revisit or discuss later.
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Zoom/Adjust Timeline Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  "bg-[var(--prism-interactive-teal-200)] hover:bg-[var(--prism-interactive-teal-100)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
                aria-label="Adjust timeline"
              >
                <Compass className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Adjust Timeline</div>
                <div className="text-xs">
                  Slide to review prior 12 h or zoom for 15 min view.
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Note Input Field (expandable) */}
        {isNoteInputOpen && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-colors",
              saveState === "idle" &&
                "bg-[var(--prism-interactive-teal-100)]/50",
              saveState === "pending" &&
                "bg-[#D1C247]/20 border-b-2 border-[#D1C247]",
              saveState === "saved" && "bg-[#218F67]/20",
            )}
          >
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record observation, action, or clarification..."
              className={cn(
                "flex-1 bg-transparent border-none text-xs placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-0",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNote();
                if (e.key === "Escape") setIsNoteInputOpen(false);
              }}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!noteText.trim() || saveState !== "idle"}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium transition-colors",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  )}
                >
                  {saveState === "saved" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    "Save"
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Saves note locally and syncs securely to chart.
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
