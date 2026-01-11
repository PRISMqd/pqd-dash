import type { MedicalDashboardData } from "@/components/medical-dashboard/types";

export function createMockMedicalDashboardData(): MedicalDashboardData {
  return {
    clinician: {
      name: "Torrez, Jennifer",
      teams: ["Critical Response", "Telemetry"],
      status: "On duty • 14 minutes into shift",
      physician: "Dr. Kathleen Rivera",
      actionLabel: "Message Clinician",
      omo: {
        observation: "Active Team: RN Torrez • MD Qureshi • RT Martin",
        meaning: "Primary care team members are online and receiving updates.",
        options:
          "Select a name to message, share a patient snapshot, or update shift assignment.",
      },
      teamMembers: [
        {
          name: "Torrez, Jennifer",
          role: "RN",
          credentials: "BSN, CCRN",
          status: "active",
        },
        {
          name: "Qureshi, Ahmed",
          role: "MD",
          credentials: "Cardiology Fellow",
          status: "active",
        },
        {
          name: "Martin, Sarah",
          role: "RT",
          credentials: "RRT",
          status: "active",
        },
      ],
      connectionStatus: "connected",
    },
    patient: {
      name: "Lee, R.",
      sex: "M",
      birthDate: "6/11/56",
      room: "204",
      codeStatus: "Full",
      isolation: "Contact Precautions",
      allergies: ["Penicillin", "Latex"],
      mobilityStatus: "Assisted ×1 with walker",
      dietOrders: "Regular diet",
      fluidRestriction: "1500 mL/24 h",
      fallRisk: true,
      omo: {
        observation:
          "Patient: Lee R. Age 68 Room 204 Code Status: Full Isolation: Contact Precautions.",
        meaning:
          "Full code; contact precautions active; fall-risk band applied.",
        options: "Select to view directives, allergies, or mobility orders.",
      },
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
        omo: {
          observation: "PQD Risk increased from 0.45 → 0.82 within 10 minutes.",
          meaning:
            "Multi-signal correlation suggests early physiologic instability.",
          options: "Review trend detail or initiate safety check-in.",
        },
      },
      notesPlaceholder:
        "No active body alerts. Use the chest hotspot or alert button to review the latest telemetry annotation.",
      acknowledgeLabel: "Acknowledge Alert",
      defaultActionLabel: "Show Latest Alert",
    },
    status: {
      summary: "Patient is resting.",
      actionLabel: "Open Care Checklist",
      omo: {
        observation: "Patient is resting.",
        meaning: "Movement minimal • Vitals stable • Monitoring active.",
        options:
          "Select to annotate activity, update status, or add observation note.",
      },
      detectedPattern: "resting",
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
      omo: {
        observation: "No active alerts.",
        meaning: "All monitored parameters within expected range.",
        options: "Review recent trend history or verify sensor placement.",
      },
    },
    policy: {
      summary:
        "Follow Acute Coronary Syndrome rapid response pathway: activate cath lab if ST elevation persists 10 minutes after nitroglycerin.",
      actionLabel: "View ACS Protocol",
      omo: {
        observation: "Policy and reference links available.",
        meaning:
          "Guidance is drawn from current institutional protocols and international best practices.",
        options:
          "Select to view applicable policy, evidence summary, or quick reference card.",
      },
      evidenceSummary: "Surviving Sepsis Campaign 2021; NEWS2 2023; AHA 2021.",
      citation:
        "Surviving Sepsis Campaign. Crit Care Med. 2021;49(6):933–941. DOI:10.1097/CCM.0000000000004965",
      triggerType: "sepsis",
    },
    notes: {
      notes: [
        {
          id: "note-1",
          timestamp: "14:20:00",
          author: "RN Torrez",
          type: "care",
          content:
            "Patient reports abdominal discomfort. May relate to post-op status. Offered reposition and monitoring.",
        },
        {
          id: "note-2",
          timestamp: "14:15:00",
          author: "RN Torrez",
          type: "equipment",
          content: "Monitor lead detached; reconnected and verified signal.",
        },
        {
          id: "note-3",
          timestamp: "14:10:00",
          author: "RN Jones",
          type: "communication",
          content: "Handoff completed to RN Torrez at 14:00 h; plan reviewed.",
        },
      ],
      omo: {
        observation: "No current notes displayed.",
        meaning:
          "Notes summarize observations, actions, and context for continuity of care.",
        options: "Add note • Filter • View history • Export summary.",
      },
    },
    sensors: [
      {
        location: "chest",
        status: "connected",
        signalQuality: 98,
        tooltip:
          "Heart sensor active; waveform stable. Leads properly oriented.",
        omo: {
          observation: "All sensors connected.",
          meaning: "Signals stable across monitored sites.",
          options:
            "Select body region to view signal trend, attachment guidance, or integrity status.",
        },
      },
      {
        location: "thorax",
        status: "connected",
        signalQuality: 95,
        tooltip: "Respiratory sensor stable; chest excursion normal.",
      },
      {
        location: "left_arm",
        status: "connected",
        signalQuality: 90,
        tooltip: "Peripheral sensor connected; perfusion index 0.9.",
      },
    ],
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
    pqdRisk: 0.42,
  };
}
