"use client";

import type { ReactNode } from "react";
import type { TimelineEvent } from "@/components/medical-dashboard/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EventDetailsModal({
  event,
  onClose,
}: {
  event: TimelineEvent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default border-0 p-0 bg-transparent"
        onClick={onClose}
        aria-label="Close event details"
      />
      <Card className="bg-card border-border p-6 max-w-md w-full mx-4 shadow-2xl relative z-10">
        <div className="space-y-4">
          <Header event={event} onClose={onClose} />
          <Section title="Description">
            <p className="text-sm text-card-foreground">{event.description}</p>
          </Section>
          <VitalsGrid event={event} />
          <div className="border-t border-border pt-4">
            <Button
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Header({
  event,
  onClose,
}: {
  event: TimelineEvent;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{event.type}</h3>
        <p className="text-sm text-muted-foreground">{event.timestamp}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}

function VitalsGrid({ event }: { event: TimelineEvent }) {
  return (
    <Section title="Vitals at Event">
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(event.vitals).map(([key, value]) => (
          <div
            key={key}
            className="bg-medical-card-overlay rounded-lg p-3 text-center"
          >
            <div className="text-xs text-muted-foreground uppercase mb-1">
              {key}
            </div>
            <div className="text-lg font-bold tracking-tight leading-none text-foreground whitespace-nowrap">
              {value}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
