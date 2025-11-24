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
    timelineEvents: Array.from({ length: 10 }).map((_, index, arr) => {
      const critical = index === 2;
      return {
        id: index + 1,
        time: `${(index / (arr.length - 1)) * 100}%`,
        color: critical ? "bg-destructive" : "bg-success",
        timestamp: `14:${20 + index}:00`,
        type: critical ? "Critical Alert" : "Telemetry",
        description: critical
          ? "Critical alert captured by timeline marker."
          : "Routine telemetry checkpoint.",
        vitals: critical
          ? { HR: 150 + index, BP: "128/86", SpO2: "94%" }
          : { HR: 90 + index, BP: "120/80", SpO2: "97%" },
      };
    }),
    initialAlertActive: false,
    bpLevel: "critical",
  };
}
