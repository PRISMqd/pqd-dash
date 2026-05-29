// PRISMqd Sepsis Case A07 — Ryan
// Source: PRISMqd_Sepsis_Case_A07_Ryan.json
// Maps 9 clinical time points to dashboard-compatible stage data

export type AlertLevel = "normal" | "warning" | "critical";

export type ScenarioStage = {
  time: string;
  clinicalNote: string;
  pqdState: string;
  pqdRisk: number;
  alertLevel: AlertLevel;
  vitals: {
    hr: number;
    hrv: number;
    rr: number;
    spo2: number;
    pi: number;
    map: number;
    sbp: number;
    dbp: number;
    temp: number;
    etco2: number;
    sv: number;
  };
  aiInsight: {
    headline: string;
    details: string[];
    recommendations: string[];
    omo: {
      observation: string;
      meaning: string;
      options: string;
    };
  };
  status: {
    label: string;
    detail: string;
  };
};

// MAP → approximate SBP/DBP (SBP ≈ MAP + 40, DBP ≈ MAP - 10)
const bpFromMap = (map: number) => ({
  sbp: Math.round(map + 40),
  dbp: Math.round(map - 10),
});

export const SEPSIS_RYAN_STAGES: ScenarioStage[] = [
  {
    time: "07:00",
    clinicalNote: "RN admit: Weak, dry mucous membranes, coarse L > R bases.",
    pqdState: "Baseline",
    pqdRisk: 0.1,
    alertLevel: "normal",
    vitals: {
      hr: 82, hrv: 60, rr: 18, spo2: 96,
      pi: 5.0, map: 84, ...bpFromMap(84),
      temp: 37.1, etco2: 35, sv: 72,
    },
    aiInsight: {
      headline: "Information",
      details: [
        "Vitals within normal limits at admission. Coarse breath sounds L > R noted.",
        "HRV 60 ms — normal autonomic tone at baseline.",
        "Perfusion index 5.0 — adequate peripheral perfusion.",
      ],
      recommendations: [
        "Continue routine monitoring per admission protocol.",
        "Document baseline vitals and establish trend reference.",
        "Confirm current medication reconciliation is complete.",
      ],
      omo: {
        observation: "Baseline established. All parameters within expected range at admission.",
        meaning: "No deviations from physiologic norms. Risk score 0.10 — low.",
        options: "Select a parameter to expand trend detail or annotate an observation.",
      },
    },
    status: {
      label: "Stable.",
      detail: "Vitals at admission baseline. Monitoring active.",
    },
  },
  {
    time: "08:00",
    clinicalNote: "CNA: Two warm blankets given; ate 25% breakfast; repositioned right.",
    pqdState: "Yellow",
    pqdRisk: 0.45,
    alertLevel: "warning",
    vitals: {
      hr: 86, hrv: 49, rr: 19, spo2: 96,
      pi: 4.7, map: 82, ...bpFromMap(82),
      temp: 37.2, etco2: 34, sv: 70,
    },
    aiInsight: {
      headline: "Early Signal",
      details: [
        "HRV declining — 49 ms from baseline 60 ms. Autonomic load increasing.",
        "HR trending upward with slight MAP softening. Early compensatory pattern.",
        "Perfusion index 4.7 — mild reduction from baseline.",
      ],
      recommendations: [
        "Increase monitoring frequency to q1h vitals.",
        "Assess fluid status — consider oral hydration if tolerating PO.",
        "Notify RN of HRV trend and request clinical reassessment.",
      ],
      omo: {
        observation: "Early signal: HRV and perfusion index declining from baseline.",
        meaning: "Compensatory physiologic response beginning. Risk score 0.45 — moderate.",
        options: "Expand trend panel or flag for RN reassessment.",
      },
    },
    status: {
      label: "Early signal detected.",
      detail: "HRV declining. Trend monitoring elevated.",
    },
  },
  {
    time: "09:00",
    clinicalNote: "CNA: Patient sleeping.",
    pqdState: "Yellow (sustained)",
    pqdRisk: 0.5,
    alertLevel: "warning",
    vitals: {
      hr: 88, hrv: 43, rr: 19, spo2: 96,
      pi: 4.4, map: 80, ...bpFromMap(80),
      temp: 37.3, etco2: 34, sv: 68,
    },
    aiInsight: {
      headline: "Sustained Yellow Signal",
      details: [
        "HRV now 43 ms — sustained decline over 2 hours. Pattern not resolving.",
        "MAP softening to 80 mmHg. HR 88 — tachycardia emerging.",
        "Temperature 37.3°C — low-grade elevation. Infectious etiology cannot be excluded.",
      ],
      recommendations: [
        "RN bedside assessment warranted — patient sleeping but signal sustained.",
        "Review recent labs; consider lactate and CBC if not already ordered.",
        "Document respiratory assessment — coarse L > R bases noted at admission.",
      ],
      omo: {
        observation: "Yellow signal sustained for 2 hours without resolution.",
        meaning: "Physiologic compensation continuing. Infection or dehydration pattern. Risk 0.50.",
        options: "Initiate RN assessment or order set review.",
      },
    },
    status: {
      label: "Signal sustained.",
      detail: "Yellow alert persisting. RN assessment recommended.",
    },
  },
  {
    time: "10:00",
    clinicalNote: "CNA: Removed linens per patient request.",
    pqdState: "Orange",
    pqdRisk: 0.62,
    alertLevel: "warning",
    vitals: {
      hr: 92, hrv: 37, rr: 20, spo2: 96,
      pi: 4.1, map: 79, ...bpFromMap(79),
      temp: 37.5, etco2: 33, sv: 66,
    },
    aiInsight: {
      headline: "Escalating Risk",
      details: [
        "Temperature 37.5°C — upward trend over 3 hours. SIRS criteria approaching.",
        "HRV 37 ms — significant reduction from 60 ms baseline. Autonomic stress pattern.",
        "HR 92, RR 20 — two of four SIRS criteria now met. Sepsis precursor pattern.",
      ],
      recommendations: [
        "Urgent RN assessment required.",
        "Consider sepsis screening protocol activation.",
        "Draw blood cultures x2, lactate, CBC with differential, BMP.",
      ],
      omo: {
        observation: "Escalating risk — SIRS criteria emerging. Orange alert.",
        meaning: "Two SIRS criteria met. Infectious etiology likely. Risk 0.62 — high.",
        options: "Activate sepsis screening or escalate to provider notification.",
      },
    },
    status: {
      label: "Risk escalating.",
      detail: "SIRS pattern emerging. Provider notification recommended.",
    },
  },
  {
    time: "12:00",
    clinicalNote: "RN: Drowsy but oriented ×4; lungs coarse L > R; O₂ 95% RA.",
    pqdState: "Red",
    pqdRisk: 0.78,
    alertLevel: "critical",
    vitals: {
      hr: 94, hrv: 33, rr: 21, spo2: 95,
      pi: 3.8, map: 77, ...bpFromMap(77),
      temp: 37.7, etco2: 32, sv: 63,
    },
    aiInsight: {
      headline: "Critical Alert",
      details: [
        "SpO₂ 95% RA — declining. Respiratory compromise present. Coarse bases confirmed by RN.",
        "HRV 33 ms — severe reduction. Sepsis-consistent autonomic pattern.",
        "MAP 77 mmHg declining. HR 94. RR 21. Temp 37.7°C. Three of four SIRS criteria met.",
      ],
      recommendations: [
        "Activate sepsis bundle immediately — Hour-1 bundle per CMS SEP-1.",
        "Initiate supplemental oxygen — titrate to SpO₂ ≥ 95%.",
        "Obtain IV access; initiate 30 mL/kg crystalloid bolus if hypoperfusion confirmed.",
      ],
      omo: {
        observation: "Critical: Sepsis bundle activation indicated. SpO₂ declining.",
        meaning: "Three SIRS criteria met. Organ perfusion at risk. Risk 0.78 — critical.",
        options: "Activate Hour-1 sepsis bundle or escalate to rapid response.",
      },
    },
    status: {
      label: "Critical alert active.",
      detail: "Sepsis pattern confirmed. Immediate intervention required.",
    },
  },
  {
    time: "13:00",
    clinicalNote: "System auto-notify.",
    pqdState: "Red (sustained)",
    pqdRisk: 0.82,
    alertLevel: "critical",
    vitals: {
      hr: 96, hrv: 28, rr: 22, spo2: 95,
      pi: 3.5, map: 77, ...bpFromMap(77),
      temp: 37.9, etco2: 31, sv: 61,
    },
    aiInsight: {
      headline: "Sustained Critical — Auto-Notify",
      details: [
        "PRISMqd system auto-notification generated. Critical state sustained 60+ minutes.",
        "HRV 28 ms — critical autonomic suppression. Consistent with septic physiology.",
        "Temperature 37.9°C continuing upward. MAP holding at 77 but perfusion index declining.",
      ],
      recommendations: [
        "Confirm sepsis bundle initiation — document time zero.",
        "Lactate result required — if ≥ 2 mmol/L, sepsis confirmed.",
        "Reassess fluid responsiveness; consider vasopressor readiness.",
      ],
      omo: {
        observation: "System auto-notify: critical risk sustained without intervention documentation.",
        meaning: "Sepsis bundle window closing. Each hour of delay increases mortality risk.",
        options: "Document bundle initiation time or escalate to rapid response team.",
      },
    },
    status: {
      label: "Auto-notify generated.",
      detail: "Critical sustained. Bundle compliance window active.",
    },
  },
  {
    time: "15:00",
    clinicalNote: "CNA: Refused lunch.",
    pqdState: "Red",
    pqdRisk: 0.88,
    alertLevel: "critical",
    vitals: {
      hr: 100, hrv: 24, rr: 23, spo2: 94,
      pi: 3.2, map: 76, ...bpFromMap(76),
      temp: 38.1, etco2: 30, sv: 58,
    },
    aiInsight: {
      headline: "Deteriorating — Intervention Gap",
      details: [
        "SpO₂ now 94% — declined from 96% at admission over 8 hours.",
        "Patient refused lunch — reduced oral intake compounding dehydration and perfusion deficit.",
        "HRV 24 ms — near-critical autonomic suppression. PI 3.2 — peripheral vasoconstriction.",
      ],
      recommendations: [
        "Rapid response team activation if not already initiated.",
        "Reassess airway — increasing RR with declining SpO₂ requires urgent evaluation.",
        "Fluid status and urine output documentation required — oliguria is a late sign.",
      ],
      omo: {
        observation: "Deterioration continuing. Intervention gap noted — 8 hours since first signal.",
        meaning: "Sepsis without timely bundle is associated with 7% mortality increase per hour delay.",
        options: "Activate rapid response or transfer to higher level of care.",
      },
    },
    status: {
      label: "Deteriorating.",
      detail: "SpO₂ declining. Rapid response recommended.",
    },
  },
  {
    time: "16:00",
    clinicalNote: "RN: Drowsy alert and oriented ×4; O₂ 94% 2L NC.",
    pqdState: "Red",
    pqdRisk: 0.9,
    alertLevel: "critical",
    vitals: {
      hr: 104, hrv: 22, rr: 24, spo2: 94,
      pi: 3.0, map: 75, ...bpFromMap(75),
      temp: 38.3, etco2: 29, sv: 55,
    },
    aiInsight: {
      headline: "High Acuity — Supplemental O₂ Initiated",
      details: [
        "Now on 2L nasal cannula — SpO₂ 94% maintained but requiring supplemental support.",
        "HR 104 — sustained tachycardia. MAP 75 — approaching sepsis hypotension threshold (<65).",
        "Temperature 38.3°C — confirmed fever. All four SIRS criteria now met. Sepsis confirmed.",
      ],
      recommendations: [
        "Confirm sepsis diagnosis documentation.",
        "Reassess vasopressor threshold — MAP target ≥ 65 mmHg.",
        "Repeat lactate if initial value not resulted; document fluid response.",
      ],
      omo: {
        observation: "All SIRS criteria met. Supplemental oxygen required. MAP approaching threshold.",
        meaning: "Sepsis confirmed. Organ dysfunction risk high. Risk 0.90 — critical.",
        options: "Review vasopressor readiness or escalate care level.",
      },
    },
    status: {
      label: "Sepsis confirmed.",
      detail: "All SIRS criteria met. 2L NC initiated. MAP monitored.",
    },
  },
  {
    time: "18:00",
    clinicalNote: "System log: Critical risk persisting.",
    pqdState: "Red",
    pqdRisk: 0.93,
    alertLevel: "critical",
    vitals: {
      hr: 108, hrv: 20, rr: 25, spo2: 93,
      pi: 2.9, map: 70, ...bpFromMap(70),
      temp: 38.4, etco2: 28, sv: 52,
    },
    aiInsight: {
      headline: "Critical — Septic Shock Threshold",
      details: [
        "MAP 70 mmHg — at septic shock threshold. Any further decline requires vasopressor.",
        "SpO₂ 93% on supplemental O₂ — respiratory failure risk increasing. RR 25.",
        "HRV 20 ms — near-complete autonomic suppression. PI 2.9 — severe peripheral vasoconstriction.",
      ],
      recommendations: [
        "Vasopressor initiation if MAP drops below 65 mmHg — norepinephrine first-line.",
        "Consider ICU transfer or step-up care evaluation.",
        "Repeat blood cultures if antibiotics not yet initiated; document antibiotic time zero.",
      ],
      omo: {
        observation: "Septic shock threshold reached. MAP 70. System critical risk log active.",
        meaning: "Without vasopressor support and source control, mortality risk is high. Risk 0.93.",
        options: "Initiate vasopressor protocol or transfer to ICU.",
      },
    },
    status: {
      label: "Septic shock threshold.",
      detail: "MAP 70. Vasopressor protocol review required.",
    },
  },
];

export const SEPSIS_RYAN_META = {
  id: "sepsis-ryan-a07",
  title: "Sepsis — Case A07",
  patient: "Ryan",
  description: "Progressive sepsis over 11 hours. Early signal at 08:00 not acted upon. SIRS criteria fully met by 16:00. Demonstrates PRISMqd detection advantage: first signal 4 hours before standard monitor alarm.",
  totalStages: SEPSIS_RYAN_STAGES.length,
};
