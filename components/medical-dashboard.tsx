"use client";

import type { ReactNode } from "react";
import type {
  MedicalDashboardData,
  TimelineEvent,
} from "@/components/medical-dashboard/types";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertLevelBar } from "@/components/alert-level-bar";
import {
  AlertStateProvider,
  useAlertState,
} from "@/components/alert-state-context";
import { AIInformationCard } from "@/components/medical-dashboard/ai-information-card";
import { AlertNotesCard } from "@/components/medical-dashboard/alert-notes-card";
import { BodyDiagramCard } from "@/components/medical-dashboard/body-diagram-card";
import {
  ClinicianCard,
  ClinicianExpandedCard,
} from "@/components/medical-dashboard/clinician-card";
import { EventDetailsModal } from "@/components/medical-dashboard/event-details-modal";
import { PatientInfoCard } from "@/components/medical-dashboard/patient-info-card";
import { PolicyInfoCard } from "@/components/medical-dashboard/policy-info-card";
import { StatusInfoCard } from "@/components/medical-dashboard/status-info-card";
import { TimelineTrack } from "@/components/medical-dashboard/timeline-track";
import { VitalSignsWaveformCard } from "@/components/vital-signs-waveform-card";
import { cn } from "@/lib/utils";

const VITAL_BASELINES = {
  heartRate: { nominal: 88, avg: 84, alert: 150 },
  respiratoryRate: { nominal: 18, avg: 17 },
  spo2: { nominal: 97, avg: 98 },
  bloodPressure: { systolic: 120, diastolic: 80 },
} as const;

type WaveformCardId =
  | "ecg-primary"
  | "blood-pressure"
  | "blood-volume"
  | "blood-oxygenation";

type DashboardCardId =
  | "clinician"
  | "body-diagram"
  | "patient"
  | "alert-notes"
  | "status"
  | "ai-insight"
  | "policy";

const CARD_ORIGIN: Record<DashboardCardId, string> = {
  clinician: "left top",
  "body-diagram": "left center",
  patient: "left bottom",
  "alert-notes": "left bottom",
  status: "right top",
  "ai-insight": "right center",
  policy: "right bottom",
};

const _CARD_ALIGNMENT: Record<
  DashboardCardId,
  { justify: string; align: string }
> = {
  clinician: { justify: "start", align: "start" },
  "body-diagram": { justify: "start", align: "center" },
  patient: { justify: "start", align: "end" },
  "alert-notes": { justify: "start", align: "end" },
  status: { justify: "end", align: "start" },
  "ai-insight": { justify: "end", align: "center" },
  policy: { justify: "end", align: "end" },
};

type WaveformChartConfig = {
  seriesId: "bloodVolume" | "bloodOxygenation" | "ecg" | "bloodPressure";
  strokeColor: string;
  yRange: [number, number];
  strokeThickness?: number;
};

const WAVEFORM_CARD_CONFIG: Record<WaveformCardId, WaveformChartConfig> = {
  "ecg-primary": {
    seriesId: "ecg",
    strokeColor: "#1E2A28",
    yRange: [0.7, 1.0],
    strokeThickness: 4,
  },
  "blood-pressure": {
    seriesId: "bloodPressure",
    strokeColor: "#1E2A28",
    yRange: [0.4, 1.0],
    strokeThickness: 4,
  },
  "blood-volume": {
    seriesId: "bloodVolume",
    strokeColor: "#1E2A28",
    yRange: [0.1, 0.5],
    strokeThickness: 4,
  },
  "blood-oxygenation": {
    seriesId: "bloodOxygenation",
    strokeColor: "#1E2A28",
    yRange: [0.0, 0.15],
    strokeThickness: 4,
  },
};

const PANEL_TRANSITION_CLASS =
  "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out";
const COLOR_TRANSITION_CLASS =
  "motion-safe:transition-colors motion-safe:duration-500 motion-safe:ease-out";

export type MedicalDashboardProps = {
  data: MedicalDashboardData;
};

type VitalSignsState = {
  heartRate: number;
  heartRateAvg: number;
  respiratoryRate: number;
  respiratoryRateAvg: number;
  spo2: number;
  spo2Avg: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
};

const createInitialVitalSigns = (): VitalSignsState => ({
  heartRate: VITAL_BASELINES.heartRate.nominal,
  heartRateAvg: VITAL_BASELINES.heartRate.avg,
  respiratoryRate: VITAL_BASELINES.respiratoryRate.nominal,
  respiratoryRateAvg: VITAL_BASELINES.respiratoryRate.avg,
  spo2: VITAL_BASELINES.spo2.nominal,
  spo2Avg: VITAL_BASELINES.spo2.avg,
  bloodPressure: { ...VITAL_BASELINES.bloodPressure },
});

export default function MedicalDashboard({ data }: MedicalDashboardProps) {
  return (
    <AlertStateProvider initialAlert={false}>
      <MedicalDashboardContent data={data} />
    </AlertStateProvider>
  );
}

function MedicalDashboardContent({ data }: { data: MedicalDashboardData }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [activeCard, setActiveCard] = useState<DashboardCardId | null>(null);
  const { isAlert, setIsAlert } = useAlertState();
  const [vitalSigns, setVitalSigns] = useState<VitalSignsState>(
    createInitialVitalSigns,
  );
  const ecgSamplesRef = useRef<number[]>([]);
  const respiratorySamplesRef = useRef<number[]>([]);
  const spo2SamplesRef = useRef<number[]>([]);
  const bloodPressureSamplesRef = useRef<number[]>([]);

  const glowForLevel = useCallback(
    (level: "normal" | "warning" | "critical") => {
      if (level === "critical") return "var(--dl-crisis)";
      if (level === "warning") return "var(--dl-warning)";
      return undefined;
    },
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVitalSigns((previous) => {
        const ecgSamples = ecgSamplesRef.current;
        const respiratorySamples = respiratorySamplesRef.current;
        const spo2Samples = spo2SamplesRef.current;
        const bpSamples = bloodPressureSamplesRef.current;

        const nextHeartRate = ecgSamples.length
          ? Math.max(
              50,
              Math.floor(
                (ecgSamples.reduce((sum, value) => sum + value, 0) /
                  ecgSamples.length) *
                  20,
              ),
            )
          : previous.heartRate;

        const bloodPressureValue = bpSamples.length
          ? bpSamples.reduce((sum, value) => sum + value, 0) / bpSamples.length
          : undefined;

        const nextSystolic =
          bloodPressureValue !== undefined
            ? Math.max(90, Math.round(bloodPressureValue * 46))
            : previous.bloodPressure.systolic;
        const nextDiastolic =
          bloodPressureValue !== undefined
            ? Math.max(50, Math.round(bloodPressureValue * 31))
            : previous.bloodPressure.diastolic;

        const respiratoryValue = respiratorySamples.length
          ? respiratorySamples.reduce((sum, value) => sum + value, 0) /
            respiratorySamples.length
          : undefined;
        const nextRespiratory =
          respiratoryValue !== undefined
            ? Math.max(10, Math.round((respiratoryValue + 8.6) * 2))
            : previous.respiratoryRate;

        const spo2Value = spo2Samples.length
          ? spo2Samples.reduce((sum, value) => sum + value, 0) /
            spo2Samples.length
          : undefined;
        const nextSpo2 =
          spo2Value !== undefined
            ? Math.min(100, Math.max(90, Math.round(spo2Value * 10 + 93)))
            : previous.spo2;

        ecgSamplesRef.current = [];
        respiratorySamplesRef.current = [];
        spo2SamplesRef.current = [];
        bloodPressureSamplesRef.current = [];

        return {
          heartRate: nextHeartRate,
          heartRateAvg: Math.round(
            (previous.heartRateAvg * 9 + nextHeartRate) / 10,
          ),
          respiratoryRate: nextRespiratory,
          respiratoryRateAvg: Math.round(
            (previous.respiratoryRateAvg * 9 + nextRespiratory) / 10,
          ),
          spo2: nextSpo2,
          spo2Avg: Math.round((previous.spo2Avg * 9 + nextSpo2) / 10),
          bloodPressure: {
            systolic: nextSystolic,
            diastolic: nextDiastolic,
          },
        };
      });
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const alertThreshold = useMemo(() => VITAL_BASELINES.heartRate.alert, []);

  const handleCardSelect = useCallback((card: DashboardCardId) => {
    setActiveCard((previous) => (previous === card ? null : card));
  }, []);

  const closeActiveCard = useCallback(() => {
    setActiveCard(null);
  }, []);

  useEffect(() => {
    if (!activeCard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeActiveCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCard, closeActiveCard]);

  const handleEcgSample = useCallback((value: number) => {
    const _heartRate = Math.max(50, Math.round(value * 180));
    ecgSamplesRef.current.push(value);
    if (ecgSamplesRef.current.length > 200) {
      ecgSamplesRef.current = ecgSamplesRef.current.slice(-200);
    }
  }, []);

  const handleBloodPressureSample = useCallback((value: number) => {
    bloodPressureSamplesRef.current.push(value);
    if (bloodPressureSamplesRef.current.length > 200) {
      bloodPressureSamplesRef.current =
        bloodPressureSamplesRef.current.slice(-200);
    }
  }, []);

  const handleBloodVolumeSample = useCallback((value: number) => {
    respiratorySamplesRef.current.push(value);
    if (respiratorySamplesRef.current.length > 200) {
      respiratorySamplesRef.current = respiratorySamplesRef.current.slice(-200);
    }
  }, []);

  const handleBloodOxygenSample = useCallback((value: number) => {
    spo2SamplesRef.current.push(value);
    if (spo2SamplesRef.current.length > 200) {
      spo2SamplesRef.current = spo2SamplesRef.current.slice(-200);
    }
  }, []);

  const heartRateLevel = useMemo<"normal" | "warning" | "critical">(() => {
    if (vitalSigns.heartRate >= alertThreshold) return "critical";
    if (vitalSigns.heartRate >= alertThreshold * 0.75) return "warning";
    return "normal";
  }, [alertThreshold, vitalSigns.heartRate]);

  const spo2Level = useMemo<"normal" | "warning" | "critical">(() => {
    if (vitalSigns.spo2 <= 90) return "critical";
    if (vitalSigns.spo2 <= 94) return "warning";
    return "normal";
  }, [vitalSigns.spo2]);

  const bpLevel = useMemo<"normal" | "warning" | "critical">(() => {
    if (data.bpLevel) return data.bpLevel;
    if (vitalSigns.bloodPressure.systolic >= 180) return "critical";
    if (vitalSigns.bloodPressure.systolic >= 150) return "warning";
    return "normal";
  }, [data.bpLevel, vitalSigns.bloodPressure.systolic]);

  return (
    <div
      className={`relative h-screen w-screen bg-background text-foreground overflow-hidden ${COLOR_TRANSITION_CLASS}`}
      style={{ padding: "var(--dl-space-padding)" }}
    >
      <div
        className={`grid h-full ${PANEL_TRANSITION_CLASS}`}
        style={{
          gridTemplateColumns: "240px 1fr 280px",
          gridTemplateRows:
            "2rem minmax(4.5rem, auto) repeat(7, minmax(0, 1fr)) auto 2rem",
          gap: "var(--dl-space-gutter)",
        }}
      >
        <div
          className={`bg-background -mx-5 -mt-5 ${COLOR_TRANSITION_CLASS}`}
          style={{ gridColumn: "1 / 4", gridRow: 1 }}
        />

        <ClinicianCard
          clinician={data.clinician}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: 2 }}
          onClick={() => handleCardSelect("clinician")}
          isActive={activeCard === "clinician"}
        />

        <BodyDiagramCard
          onActivateAlert={() => {
            setIsAlert(true);
          }}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "3 / 7" }}
          onClick={() => handleCardSelect("body-diagram")}
          isActive={activeCard === "body-diagram"}
        />

        <PatientInfoCard
          patient={data.patient}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "7 / 8" }}
          onClick={() => handleCardSelect("patient")}
          isActive={activeCard === "patient"}
        />

        <AlertNotesCard
          config={data.alert}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "8 / 10" }}
          onClick={() => handleCardSelect("alert-notes")}
          isActive={activeCard === "alert-notes"}
        />

        <div
          className={`${PANEL_TRANSITION_CLASS}`}
          style={{
            gridColumn: 2,
            gridRow: 2,
            padding: "var(--dl-space-unit) * 2",
          }}
        >
          <div
            className={`grid grid-cols-8 ${COLOR_TRANSITION_CLASS}`}
            style={{ gap: "var(--dl-space-gutter)" }}
          >
            <VitalSign label="SV" value="87.0" avg="88.0" />
            <VitalSign label="Temp" value="98.4°" avg="98.4" />
            <VitalSign
              label="RR"
              value={vitalSigns.respiratoryRate.toString()}
              avg={vitalSigns.respiratoryRateAvg.toString()}
            />
            <div className="col-span-2">
              <VitalSign
                label="HR"
                value={vitalSigns.heartRate.toString()}
                avg={vitalSigns.heartRateAvg.toString()}
                alert={heartRateLevel === "critical"}
                large
                glowColor={glowForLevel(heartRateLevel)}
              />
            </div>
            <VitalSign
              label="SpO2"
              value={`${vitalSigns.spo2}%`}
              avg={`${vitalSigns.spo2Avg}%`}
              alert={spo2Level === "critical"}
              glowColor={glowForLevel(spo2Level)}
            />
            <VitalSign
              label="BP"
              value={vitalSigns.bloodPressure.systolic.toString()}
              subValue={vitalSigns.bloodPressure.diastolic.toString()}
              avg={`${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`}
              alert={bpLevel === "critical"}
              glowColor={glowForLevel(bpLevel)}
            />
            <VitalSign label="EtCO2" value="40" avg="40" />
          </div>
        </div>

        <div
          className={`grid h-full gap-2 grid-rows-6 ${PANEL_TRANSITION_CLASS}`}
          style={{ gridColumn: 2, gridRow: "3 / 8 " }}
        >
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="blood-pressure"
              config={WAVEFORM_CARD_CONFIG["blood-pressure"]}
              label="ABP"
              unit="mmHg"
              displayValue={`${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`}
              style={{ height: "100%" }}
              onSampleAction={handleBloodPressureSample}
              alertLevel={bpLevel}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="blood-volume"
              config={WAVEFORM_CARD_CONFIG["blood-volume"]}
              label="Pleth"
              showDelta={true}
              style={{ height: "100%" }}
              onSampleAction={handleBloodVolumeSample}
              alertLevel="normal"
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="ecg-primary-1"
              config={WAVEFORM_CARD_CONFIG["ecg-primary"]}
              label="ECG II"
              unit="bpm"
              displayValue={vitalSigns.heartRate.toString()}
              style={{ height: "100%" }}
              onSampleAction={handleEcgSample}
              alertLevel={heartRateLevel}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="ecg-primary-2"
              config={WAVEFORM_CARD_CONFIG["ecg-primary"]}
              label="ECG II"
              unit="bpm"
              displayValue={vitalSigns.heartRate.toString()}
              style={{ height: "100%" }}
              onSampleAction={handleEcgSample}
              alertLevel={heartRateLevel}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="blood-oxygenation"
              config={WAVEFORM_CARD_CONFIG["blood-oxygenation"]}
              label="SpO₂"
              unit="%"
              displayValue={vitalSigns.spo2.toString()}
              style={{ height: "100%" }}
              onSampleAction={handleBloodOxygenSample}
              alertLevel={spo2Level}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="placeholder-1"
              config={WAVEFORM_CARD_CONFIG["blood-oxygenation"]}
              label=""
              unit="%"
              style={{ height: "100%" }}
              onSampleAction={handleBloodOxygenSample}
            />
          </div>
        </div>

        <div
          className={`h-full flex flex-col justify-center items-center ${PANEL_TRANSITION_CLASS}`}
          style={{ gridColumn: 2, gridRow: 8 }}
        >
          <div
            className={`flex flex-col gap-3 p-1.5 w-full h-[30] ${PANEL_TRANSITION_CLASS}`}
          >
            <TimelineTrack
              events={data.timelineEvents}
              className={COLOR_TRANSITION_CLASS}
              onSelectEventAction={(event) => setSelectedEvent(event)}
            />
          </div>
        </div>

        <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
          <VitalSignsWaveformCard
            chartId="ecg-bottom"
            config={WAVEFORM_CARD_CONFIG["ecg-primary"]}
            label="ECG II"
            unit="bpm"
            displayValue={vitalSigns.heartRate.toString()}
            style={{ height: "100%" }}
            onSampleAction={handleEcgSample}
            alertLevel={heartRateLevel}
          />
        </div>

        <StatusInfoCard
          content={data.status}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 3, gridRow: 2 }}
          onClick={() => handleCardSelect("status")}
          isActive={activeCard === "status"}
        />

        <div
          className={`flex gap-1.5 ${PANEL_TRANSITION_CLASS}`}
          style={{ gridColumn: 3, gridRow: "3 / 8" }}
        >
          <AIInformationCard
            insight={data.aiInsight}
            className={PANEL_TRANSITION_CLASS}
            onClick={() => handleCardSelect("ai-insight")}
            isActive={activeCard === "ai-insight"}
          />
          <AlertLevelBar
            level={isAlert ? 75 : 25}
            className={PANEL_TRANSITION_CLASS}
          />
        </div>

        <PolicyInfoCard
          policy={data.policy}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 3, gridRow: "8 / 11" }}
          onClick={() => handleCardSelect("policy")}
          isActive={activeCard === "policy"}
        />

        <div
          className={`bg-background -mx-5 -mb-5 ${COLOR_TRANSITION_CLASS}`}
          style={{ gridColumn: "1 / 4", gridRow: 11 }}
        />
      </div>

      {activeCard ? (
        <ExpandedCardOverlay cardId={activeCard} onClose={closeActiveCard}>
          {renderExpandedCard({
            activeCard,
            data,
            closeActiveCard,
          })}
        </ExpandedCardOverlay>
      ) : null}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export function VitalSign({
  label,
  value,
  subValue,
  avg,
  alert,
  large,
  glowColor,
  glowBlur = 14,
}: {
  label: string;
  value: string;
  subValue?: string;
  avg: string;
  alert?: boolean;
  large?: boolean;
  glowColor?: string;
  glowBlur?: number;
}) {
  const glowStyle = glowColor
    ? {
        textShadow: `0 0 ${glowBlur}px ${glowColor}, 0 0 ${glowBlur * 0.6}px ${glowColor}`,
      }
    : undefined;

  return (
    <div
      className={`flex flex-col justify-between px-2 py-2 ${PANEL_TRANSITION_CLASS}`}
    >
      <div
        className={`h-5 flex items-center justify-center ${COLOR_TRANSITION_CLASS}`}
      >
        <div className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {label}
        </div>
      </div>
      <div
        className={`flex flex-col items-center justify-center ${large ? "h-20" : "h-16"} ${PANEL_TRANSITION_CLASS}`}
      >
        <div
          className={`${large ? "text-5xl" : "text-3xl"} font-bold tracking-tight leading-none ${alert ? "text-destructive" : "text-foreground"} whitespace-nowrap ${COLOR_TRANSITION_CLASS}`}
          style={glowStyle}
        >
          {value}
        </div>
        {subValue && (
          <div
            className={`text-xl font-bold text-foreground/90 leading-none mt-1 whitespace-nowrap ${COLOR_TRANSITION_CLASS}`}
          >
            {subValue}
          </div>
        )}
      </div>
      <div
        className={`h-5 flex items-center justify-center ${COLOR_TRANSITION_CLASS}`}
      >
        <div className="text-xs font-bold text-muted-foreground/70 whitespace-nowrap">
          AVG {avg}
        </div>
      </div>
    </div>
  );
}

type ExpandedCardProps = {
  activeCard: DashboardCardId;
  data: MedicalDashboardData;
  closeActiveCard: () => void;
};

function renderExpandedCard({
  activeCard,
  data,
  closeActiveCard,
}: ExpandedCardProps) {
  switch (activeCard) {
    case "clinician":
      return (
        <ClinicianExpandedCard
          clinician={data.clinician}
          onClose={closeActiveCard}
        />
      );
    case "body-diagram":
      return <BodyDiagramExpanded onClose={closeActiveCard} />;
    case "patient":
      return (
        <PatientExpanded patient={data.patient} onClose={closeActiveCard} />
      );
    case "alert-notes":
      return (
        <AlertNotesExpanded config={data.alert} onClose={closeActiveCard} />
      );
    case "status":
      return <StatusExpanded content={data.status} onClose={closeActiveCard} />;
    case "ai-insight":
      return <AIExpanded insight={data.aiInsight} onClose={closeActiveCard} />;
    case "policy":
      return <PolicyExpanded policy={data.policy} onClose={closeActiveCard} />;
    default:
      return null;
  }
}

function ExpandedCardOverlay({
  children,
  cardId,
  onClose,
}: {
  children: ReactNode;
  cardId: DashboardCardId;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 p-3 md:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Close expanded card"
      />
      <div className="relative z-10 pointer-events-auto w-full flex items-start justify-end">
        <div style={{ transformOrigin: CARD_ORIGIN[cardId] }}>{children}</div>
      </div>
    </div>
  );
}

function ExpandedSurface({
  children,
  onClose,
  widthClass = "w-[min(80vw,1100px)]",
}: {
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col max-w-[calc(100vw-1.5rem)] min-h-[40vh] md:min-h-[45vh] max-h-[calc(100vh-1.5rem)] overflow-auto",
        widthClass,
        PANEL_TRANSITION_CLASS,
      )}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        borderRadius: "var(--dl-radius)",
        border: "2px solid #3F6E67",
        boxShadow: "var(--dl-shadow)",
        backgroundColor: "#b7d8d1",
        color: "#1e2a28",
        padding: "calc(var(--dl-space-padding) + 8px)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-[#1e2a28]/80 hover:text-[#1e2a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6E67]"
        aria-label="Close expanded view"
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
      {children}
    </div>
  );
}

const ACTION_STUB_CLASS =
  "rounded-xl bg-[#7cb7aa] shadow-inner border border-[#6aa194]/60";

const ACTION_STUB_KEYS = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
];

function ActionStub({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Placeholder action"
      className={cn(
        ACTION_STUB_CLASS,
        "opacity-90 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6E67]",
        className,
      )}
      disabled
    />
  );
}

function ActionStubRow({
  count = 4,
  alignBottom,
  className,
}: {
  count?: number;
  alignBottom?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 sm:grid-cols-4 gap-4",
        alignBottom ? "mt-auto pt-4" : "mt-6",
        className,
      )}
    >
      {ACTION_STUB_KEYS.slice(0, count).map((key) => (
        <ActionStub key={key} className="h-20" />
      ))}
    </div>
  );
}

function BodyDiagramExpanded({ onClose }: { onClose: () => void }) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(90vw,520px)]">
      <div className="relative w-full aspect-[3/4] max-h-[70vh] overflow-hidden rounded-xl border border-[#3F6E67]/60 bg-[#9fcac0]">
        <Image
          src="/images/body-diagram.svg"
          alt="Body diagram expanded"
          fill
          priority
          style={{ objectFit: "cover", pointerEvents: "none" }}
          sizes="(min-width: 1280px) 420px, 80vw"
        />
        <div className="absolute left-4 top-6 flex flex-col gap-4">
          {ACTION_STUB_KEYS.slice(0, 4).map((key) => (
            <ActionStub key={key} className="h-16 w-16" />
          ))}
        </div>
      </div>
    </ExpandedSurface>
  );
}

function PatientExpanded({
  patient,
  onClose,
}: {
  patient: MedicalDashboardData["patient"];
  onClose: () => void;
}) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(88vw,760px)]">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="space-y-2 text-lg font-semibold">
          <div>Patient:</div>
          <div>
            <span className="font-bold">Name:</span> {patient.name}
          </div>
          <div>{`${patient.sex} ${patient.birthDate}`}</div>
        </div>
        <div className="flex-1" />
        <ActionStubRow alignBottom />
      </div>
    </ExpandedSurface>
  );
}

function AlertNotesExpanded({
  config,
  onClose,
}: {
  config: MedicalDashboardData["alert"];
  onClose: () => void;
}) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(90vw,880px)]">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="text-lg font-semibold">Notes:</div>
        <p className="text-base leading-relaxed">{config.notesPlaceholder}</p>
        <div className="flex-1" />
        <ActionStubRow alignBottom />
      </div>
    </ExpandedSurface>
  );
}

function StatusExpanded({
  content,
  onClose,
}: {
  content: MedicalDashboardData["status"];
  onClose: () => void;
}) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(88vw,900px)]">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="text-lg font-semibold">Status:</div>
        <p className="text-base leading-relaxed">{content.summary}</p>
        <div className="flex-1" />
        <ActionStubRow alignBottom />
      </div>
    </ExpandedSurface>
  );
}

function AIExpanded({
  insight,
  onClose,
}: {
  insight: MedicalDashboardData["aiInsight"];
  onClose: () => void;
}) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(88vw,900px)]">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="text-lg font-semibold">{insight.headline}</div>
        <div className="space-y-2 text-base leading-relaxed">
          {insight.details.slice(0, 2).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex-1" />
        <ActionStubRow alignBottom />
      </div>
    </ExpandedSurface>
  );
}

function PolicyExpanded({
  policy,
  onClose,
}: {
  policy: MedicalDashboardData["policy"];
  onClose: () => void;
}) {
  return (
    <ExpandedSurface onClose={onClose} widthClass="w-[min(88vw,900px)]">
      <div className="flex flex-col flex-1 h-full gap-4">
        <div className="text-lg font-semibold">Policy Information:</div>
        <p className="text-base leading-relaxed">{policy.summary}</p>
        <div className="flex-1" />
        <ActionStubRow alignBottom />
      </div>
    </ExpandedSurface>
  );
}

export {
  ExpandedSurface,
  ActionStubRow,
  BodyDiagramExpanded,
  PatientExpanded,
  AlertNotesExpanded,
  StatusExpanded,
  AIExpanded,
  PolicyExpanded,
  ClinicianExpandedCard,
};
