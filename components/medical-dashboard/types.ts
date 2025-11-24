"use client";

export type ClinicianDetails = {
  name: string;
  teams: string[];
  status: string;
  physician: string;
  actionLabel: string;
};

export type PatientDetails = {
  name: string;
  sex: string;
  birthDate: string;
};

export type TimelineEvent = {
  id: number;
  time: string;
  color: string;
  timestamp: string;
  type: string;
  description: string;
  vitals: Record<string, string | number>;
};

export type AlertDetails = {
  title: string;
  summary: string;
  location: string;
  priority: string;
  recordedAt: string;
  escalationNote?: string;
};

export type StatusPanelContent = {
  summary: string;
  actionLabel: string;
};

export type AiInsight = {
  headline: string;
  details: string[];
  recommendations: string[];
};

export type PolicyReference = {
  summary: string;
  actionLabel: string;
};

export type AlertNoteConfig = {
  details: AlertDetails;
  notesPlaceholder: string;
  acknowledgeLabel: string;
  defaultActionLabel: string;
};

export type MedicalDashboardData = {
  clinician: ClinicianDetails;
  patient: PatientDetails;
  timelineEvents: TimelineEvent[];
  alert: AlertNoteConfig;
  status: StatusPanelContent;
  aiInsight: AiInsight;
  policy: PolicyReference;
  initialAlertActive?: boolean;
  bpLevel?: "normal" | "warning" | "critical";
};
