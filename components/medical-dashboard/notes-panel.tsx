"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type {
  ClinicalNote,
  NotesPanel as NotesPanelType,
  NoteType,
} from "@/components/medical-dashboard/types";
import { Filter, History, Pencil, Share, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Note type styling per COPY.md Box 7
const NOTE_TYPE_STYLES: Record<NoteType, { label: string; color: string }> = {
  care: { label: "Care", color: "bg-[#218F67]/20 text-[#218F67]" },
  behavior: { label: "Behavior", color: "bg-[#4B90A6]/20 text-[#4B90A6]" },
  communication: {
    label: "Communication",
    color: "bg-[#D1C247]/20 text-[#7B6645]",
  },
  equipment: { label: "Equipment", color: "bg-[#6B7280]/20 text-[#6B7280]" },
};

// OMO content per COPY.md Box 7
const NOTES_OMO = {
  observation: "No current notes displayed.",
  meaning:
    "Notes summarize observations, actions, and context for continuity of care.",
  options: "Add note • Filter • View history • Export summary.",
};

export function NotesPanel({
  notes,
  className,
  style,
  onClick,
  isActive,
  onAddNote,
}: {
  notes: NotesPanelType;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  onAddNote?: (note: Omit<ClinicalNote, "id">) => void;
}) {
  const [filterType, setFilterType] = useState<NoteType | "all">("all");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteType, setNewNoteType] = useState<NoteType>("care");
  const [saveState, setSaveState] = useState<"idle" | "pending" | "saved">(
    "idle",
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const filteredNotes =
    filterType === "all"
      ? notes.notes
      : notes.notes.filter((note) => note.type === filterType);

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    setSaveState("pending");
    setTimeout(() => {
      onAddNote?.({
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        author: "Current User",
        type: newNoteType,
        content: newNoteText,
      });
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
        setNewNoteText("");
        setIsAddingNote(false);
      }, 1000);
    }, 500);
  };

  const observation = notes.omo?.observation ?? NOTES_OMO.observation;
  const meaning = notes.omo?.meaning ?? NOTES_OMO.meaning;

  return (
    <Card
      className={cn(
        "flex-1 min-h-0 gap-0 py-0 bg-transparent border-[#3F6E67]/40",
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
      onClick={(e) => {
        // Prevent click from bubbling if clicking on interactive elements
        if ((e.target as HTMLElement).closest("button, input, select")) return;
        onClick?.();
      }}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="px-2.5 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold">Notes</CardTitle>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingNote(!isAddingNote);
                    }}
                    className={cn(
                      "w-5 h-5 rounded flex items-center justify-center",
                      "hover:bg-primary/10 transition-colors",
                      isAddingNote && "bg-primary/10",
                    )}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Record what you observed or did. Be factual and concise.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFilterType(e.target.value as NoteType | "all");
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] bg-transparent border-none cursor-pointer focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="care">Care</option>
                    <option value="behavior">Behavior</option>
                    <option value="communication">Comm</option>
                    <option value="equipment">Equip</option>
                  </select>
                </TooltipTrigger>
                <TooltipContent>
                  Show notes by type (e.g., care, behavior, communication).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2.5 pb-2.5 text-xs leading-relaxed">
        {/* Add Note Input */}
        {isAddingNote && (
          // biome-ignore lint/a11y/noStaticElementInteractions: Container prevents click propagation to parent
          <div
            className={cn(
              "mb-2 p-2 rounded-lg space-y-2 transition-colors",
              saveState === "idle" &&
                "bg-[#4B90A6]/10 border border-[#4B90A6]/30",
              saveState === "pending" &&
                "bg-[#D1C247]/20 border border-[#D1C247]",
              saveState === "saved" &&
                "bg-[#218F67]/20 border border-[#218F67]",
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <select
                value={newNoteType}
                onChange={(e) => setNewNoteType(e.target.value as NoteType)}
                className="text-[10px] bg-transparent border border-current/20 rounded px-1 py-0.5"
              >
                <option value="care">Care</option>
                <option value="behavior">Behavior</option>
                <option value="communication">Communication</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Enter observation..."
              className="w-full bg-transparent border-none text-xs placeholder:text-muted-foreground/60 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNote();
                if (e.key === "Escape") setIsAddingNote(false);
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={!newNoteText.trim() || saveState !== "idle"}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {saveState === "saved" ? "✓ Saved" : "Save"}
              </button>
            </div>
          </div>
        )}

        <ScrollArea className="h-full" contentClassName="space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="space-y-1 text-muted-foreground">
              <p>{observation}</p>
              <p className="text-[10px]">{meaning}</p>
            </div>
          ) : (
            filteredNotes.map((note) => <NoteEntry key={note.id} note={note} />)
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function NoteEntry({ note }: { note: ClinicalNote }) {
  const typeStyle = NOTE_TYPE_STYLES[note.type];

  return (
    <div className="p-2 rounded-lg bg-background/50 border border-current/10 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-medium",
            typeStyle.color,
          )}
        >
          {typeStyle.label}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {note.timestamp} • {note.author}
        </span>
      </div>
      <p className="text-xs leading-relaxed">{note.content}</p>
    </div>
  );
}

// Expanded Notes Panel for modal view
export function NotesExpandedPanel({
  notes,
  onClose,
}: {
  notes: NotesPanelType;
  onClose: () => void;
}) {
  const [filterType, setFilterType] = useState<NoteType | "all">("all");

  const filteredNotes =
    filterType === "all"
      ? notes.notes
      : notes.notes.filter((note) => note.type === filterType);

  return (
    <div
      className="relative w-full max-w-3xl min-h-[50vh] max-h-[80vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Notes panel expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close notes panel"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Header with filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#1e2a28]/70">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as NoteType | "all")}
            className="text-sm bg-[#9fcac0] border border-[#3F6E67]/30 rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="care">Care</option>
            <option value="behavior">Behavior</option>
            <option value="communication">Communication</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
      </div>

      {/* OMO Content */}
      <div className="mb-4 text-sm text-[#1e2a28]/70">
        {notes.omo?.meaning ?? NOTES_OMO.meaning}
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 mb-6">
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-[#1e2a28]/50">
              No notes match the current filter.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-[#9fcac0] border border-[#3F6E67]/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      NOTE_TYPE_STYLES[note.type].color,
                    )}
                  >
                    {NOTE_TYPE_STYLES[note.type].label}
                  </span>
                  <span className="text-sm text-[#1e2a28]/70">
                    {note.timestamp} • {note.author}
                  </span>
                </div>
                <p className="text-base leading-relaxed">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Pencil className="w-5 h-5" />
                <span className="text-xs font-medium">New Note</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Record what you observed or did. Be factual and concise.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="text-xs font-medium">Filter</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Show notes by type (e.g., care, behavior, communication).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">View History</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Scroll timeline of prior entries with timestamps.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="h-16 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-1 hover:bg-[#6aa194] transition-colors"
              >
                <Share className="w-5 h-5" />
                <span className="text-xs font-medium">Export Summary</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Generate concise shift or event summary.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
