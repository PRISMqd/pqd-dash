"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type {
  ClinicianDetails,
  TeamMember,
  TeamMemberStatus,
} from "@/components/medical-dashboard/types";
import { AlertTriangle, Camera, RefreshCw, Send, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CONNECTION_STATUS_COLORS = {
  connected: "border-[#218F67]",
  partial: "border-[#D1C247]",
  disconnected: "border-[#C22D4D]",
} as const;

const MEMBER_STATUS_COLORS: Record<TeamMemberStatus, string> = {
  active: "bg-[#218F67]",
  inactive: "bg-[#D1C247]",
  offline: "bg-[#6B7280]",
};

const MEMBER_STATUS_TOOLTIP: Record<TeamMemberStatus, string> = {
  active: "Active and receiving updates",
  inactive: "Inactive > 15 min",
  offline: "Offline",
};

export function ClinicianCard({
  clinician,
  className,
  style,
  onClick,
  isActive,
}: {
  clinician: ClinicianDetails;
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

  const connectionBorder = clinician.connectionStatus
    ? CONNECTION_STATUS_COLORS[clinician.connectionStatus]
    : "";

  return (
    <Card
      className={cn(
        "bg-transparent border-[#3F6E67]/40 min-h-0 gap-0 py-0",
        connectionBorder,
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
      aria-expanded={onClick ? (isActive ?? false) : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="px-2.5 py-2">
        <CardTitle className="text-xs font-semibold text-primary">
          Active Team
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2.5 pb-2.5 text-xs space-y-1.5">
        {clinician.teamMembers && clinician.teamMembers.length > 0 ? (
          <TooltipProvider>
            <div className="space-y-1">
              {clinician.teamMembers.map((member) => (
                <TeamMemberRow key={member.name} member={member} />
              ))}
            </div>
          </TooltipProvider>
        ) : (
          <div className="space-y-0.5">
            <InfoRow label="Name" value={clinician.name} />
            <InfoRow label="Teams" value={clinician.teams.join(", ")} />
            <InfoRow label="Status" value={clinician.status} />
          </div>
        )}
        <div className="pt-1.5 space-y-0.5">
          <div className="text-xs font-semibold">Physician</div>
          <div className="text-xs">{clinician.physician}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded px-1 py-0.5 -mx-1">
          <span
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              MEMBER_STATUS_COLORS[member.status],
            )}
            aria-hidden="true"
          />
          <span className="font-medium">{member.role}</span>
          <span className="text-muted-foreground truncate">{member.name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <div className="font-semibold">
            {member.name}
            {member.credentials && (
              <span className="font-normal text-muted-foreground">
                {" "}
                • {member.credentials}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {MEMBER_STATUS_TOOLTIP[member.status]}
          </div>
          <div className="text-xs">
            Click to view role, credentials, and contact options.
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

export function ClinicianExpandedCard({
  clinician,
  onClose,
}: {
  clinician: ClinicianDetails;
  onClose: () => void;
}) {
  return (
    <div
      className="relative w-full max-w-5xl min-h-[55vh] md:min-h-[60vh] rounded-2xl border-2 border-[#3F6E67]/70 bg-[#b7d8d1] text-[#1e2a28] shadow-[0_12px_24px_rgba(0,0,0,0.28)] p-6 md:p-8 flex flex-col"
      role="dialog"
      aria-label="Clinician details expanded"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close clinician details"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* OMO Content */}
      {clinician.omo && (
        <div className="space-y-4 mb-6">
          <div className="text-lg font-semibold">
            {clinician.omo.observation}
          </div>
          <div className="text-base text-[#1e2a28]/80">
            {clinician.omo.meaning}
          </div>
          <div className="text-sm text-[#1e2a28]/70 italic">
            {clinician.omo.options}
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      {clinician.teamMembers && clinician.teamMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {clinician.teamMembers.map((member) => (
            <div
              key={member.name}
              className="p-4 rounded-xl bg-[#9fcac0] border border-[#3F6E67]/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full",
                    MEMBER_STATUS_COLORS[member.status],
                  )}
                />
                <span className="font-bold">{member.role}</span>
              </div>
              <div className="text-lg font-semibold">{member.name}</div>
              {member.credentials && (
                <div className="text-sm text-[#1e2a28]/70">
                  {member.credentials}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ActionButton
          icon={<Send className="w-6 h-6" />}
          label="Message"
          tooltip="Send a quick update or question to the selected team member."
        />
        <ActionButton
          icon={<Camera className="w-6 h-6" />}
          label="Share Snapshot"
          tooltip="Share current screen view for review or teaching."
        />
        <ActionButton
          icon={<AlertTriangle className="w-6 h-6 text-[#C22D4D]" />}
          label="Escalate"
          tooltip="If the situation appears to worsen, consider alerting Rapid Response."
        />
        <ActionButton
          icon={<RefreshCw className="w-6 h-6" />}
          label="Refresh"
          tooltip="Update team list and connection indicators."
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="h-24 rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60 flex flex-col items-center justify-center gap-2 hover:bg-[#6aa194] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]"
          >
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
