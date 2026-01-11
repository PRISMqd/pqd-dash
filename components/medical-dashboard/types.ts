"use client";

// OMO (Observation-Meaning-Options) structure for all panels
export type OMOContent = {
  observation: string;
  meaning: string;
  options: string;
};

// Team member status for clinician panel
export type TeamMemberStatus = "active" | "inactive" | "offline";

export type TeamMember = {
  name: string;
  role: string;
  credentials?: string;
  status: TeamMemberStatus;
  lastActive?: string;
};

export type ClinicianDetails = {
  name: string;
  teams: string[];
  status: string;
  physician: string;
  actionLabel: string;
  // New OMO-structured content
  omo?: OMOContent;
  teamMembers?: TeamMember[];
  connectionStatus?: "connected" | "partial" | "disconnected";
};

export type PatientDetails = {
  name: string;
  sex: string;
  birthDate: string;
  // Extended patient info per Box 8
  room?: string;
  codeStatus?: "Full" | "DNR" | "Comfort";
  isolation?: string;
  allergies?: string[];
  mobilityStatus?: string;
  dietOrders?: string;
  fluidRestriction?: string;
  fallRisk?: boolean;
  omo?: OMOContent;
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

export type AlertLevel = "normal" | "warning" | "critical";

// Alert details with OMO structure per Box 4
export type AlertDetails = {
  title: string;
  summary: string;
  location: string;
  priority: string;
  recordedAt: string;
  escalationNote?: string;
  omo?: OMOContent;
};

export type StatusPanelContent = {
  summary: string;
  actionLabel: string;
  // OMO-structured content per Box 3
  omo?: OMOContent;
  detectedPattern?:
    | "resting"
    | "active"
    | "movement_with_respiratory"
    | "prolonged_inactivity"
    | "procedure"
    | "signal_loss";
};

export type AiInsight = {
  headline: string;
  details: string[];
  recommendations: string[];
  omo?: OMOContent;
};

// Policy references with evidence citations per Box 5
export type PolicyReference = {
  summary: string;
  actionLabel: string;
  omo?: OMOContent;
  evidenceSummary?: string;
  citation?: string;
  triggerType?:
    | "sepsis"
    | "opioid"
    | "delirium"
    | "skin_integrity"
    | "alarm_fatigue"
    | "general";
};

export type AlertNoteConfig = {
  details: AlertDetails;
  notesPlaceholder: string;
  acknowledgeLabel: string;
  defaultActionLabel: string;
};

// Vital sign tooltip content per Box 2
export type VitalSignTooltip = {
  standard: string;
  high?: string;
  low?: string;
};

export type VitalSignConfig = {
  label: string;
  value: string | number;
  unit?: string;
  avg?: string | number;
  tooltip?: VitalSignTooltip;
  alertLevel?: AlertLevel;
};

// Sensor status for body diagram per Box 9
export type SensorStatus =
  | "connected"
  | "disconnected"
  | "trending"
  | "critical";

export type SensorLocation =
  | "chest"
  | "thorax"
  | "left_arm"
  | "right_arm"
  | "head"
  | "posture";

export type SensorInfo = {
  location: SensorLocation;
  status: SensorStatus;
  signalQuality?: number;
  tooltip?: string;
  omo?: OMOContent;
};

// Notes panel types per Box 7
export type NoteType = "care" | "behavior" | "communication" | "equipment";

export type ClinicalNote = {
  id: string;
  timestamp: string;
  author: string;
  type: NoteType;
  content: string;
  omo?: OMOContent;
};

export type NotesPanel = {
  notes: ClinicalNote[];
  omo?: OMOContent;
};

// Waveform panel types per Box 10
export type WaveformState = "stable" | "trending" | "critical" | "artifact";

export type WaveformConfig = {
  seriesId: string;
  label: string;
  unit: string;
  state?: WaveformState;
  omo?: OMOContent;
};

export type MedicalDashboardData = {
  clinician: ClinicianDetails;
  patient: PatientDetails;
  timelineEvents: TimelineEvent[];
  alert: AlertNoteConfig;
  status: StatusPanelContent;
  aiInsight: AiInsight;
  policy: PolicyReference;
  notes?: NotesPanel;
  sensors?: SensorInfo[];
  initialAlertActive?: boolean;
  bpLevel?: AlertLevel;
  pqdRisk?: number;
};
