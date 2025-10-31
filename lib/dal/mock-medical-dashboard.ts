import type { MedicalDashboardData } from "@/components/medical-dashboard/types";

export function createMockMedicalDashboardData(): MedicalDashboardData {
  return {
    clinician: {
      name: "Torrez, Jennifer",
      teams: ["Critical Response", "Telemetry"],
      status: "On duty • 14 minutes into shift",
      physician: "Dr. Kathleen Rivera",
      actionLabel: "Message Clinician",
    },
    patient: {
      name: "Doe, Johnathon",
      sex: "M",
      birthDate: "6/11/75",
    },
    alert: {
      details: {
        title: "Active Critical Alert",
        summary: "Sustained tachycardia with ST segment elevation detected.",
        location: "Anterior chest leads V2–V4",
        priority: "High",
        recordedAt: "14:23:15",
        escalationNote:
          "AI triage flagged a 9% probability of acute coronary syndrome based on ECG morphology and perfusion trends.",
      },
      notesPlaceholder:
        "No active body alerts. Use the chest hotspot or alert button to review the latest telemetry annotation.",
      acknowledgeLabel: "Acknowledge Alert",
      defaultActionLabel: "Show Latest Alert",
    },
    status: {
      summary: "Patient is resting.",
      actionLabel: "Open Care Checklist",
    },
    aiInsight: {
      headline: "Information",
      details: [
        "ECG waveform shows persistent ST elevation in V3/V4 with rising high-frequency variance, consistent with myocardial ischemia under sympathetic stress.",
        "Blood pressure waveform reveals widened pulse pressure and occasional dicrotic notch blunting following nitroglycerin dose.",
        "Pulse oximetry remains 94–95% but pleth variability increased 18% relative to baseline, aligning with reduced peripheral perfusion.",
      ],
      recommendations: [
        "Initiate STEMI protocol checklist and confirm cath lab availability.",
        "Draw repeat cardiac enzymes and prepare dual antiplatelet therapy per cardiology guidance.",
        "Engage respiratory therapy to verify mask fit and adjust FiO₂ if SpO₂ remains below 95%.",
      ],
    },
    policy: {
      summary:
        "Follow Acute Coronary Syndrome rapid response pathway: activate cath lab if ST elevation persists 10 minutes after nitroglycerin.",
      actionLabel: "View ACS Protocol",
    },
    timelineEvents: [
      {
        id: 1,
        time: "10%",
        color: "bg-destructive",
        timestamp: "14:23:15",
        type: "Critical Alert",
        description:
          "Heart rate exceeded 150 bpm for 90 seconds post-ambulation while ST elevation persisted.",
        vitals: { HR: 152, BP: "128/86", SpO2: "94%" },
      },
      {
        id: 2,
        time: "46%",
        color: "bg-warning",
        timestamp: "14:45:32",
        type: "Warning",
        description:
          "Respiratory rate trending upward with shallow tidal volume; tidal CO₂ dropped 3 mmHg.",
        vitals: { RR: 32, Temp: "99.1°F", SpO2: "95%" },
      },
      {
        id: 3,
        time: "63%",
        color: "bg-warning",
        timestamp: "15:12:08",
        type: "Warning",
        description:
          "Blood pressure variability increased following nitroglycerin dose; MAP stable at 101.",
        vitals: { BP: "130/88", HR: 145, MAP: 101 },
      },
    ],
    initialAlertActive: false,
  };
}
