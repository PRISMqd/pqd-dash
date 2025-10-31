"use client";

import type {
  MedicalDashboardData,
  TimelineEvent,
} from "@/components/medical-dashboard/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertLevelBar } from "@/components/alert-level-bar";
import {
  AlertStateProvider,
  useAlertState,
} from "@/components/alert-state-context";
import { AIInformationCard } from "@/components/medical-dashboard/ai-information-card";
import { AlertNotesCard } from "@/components/medical-dashboard/alert-notes-card";
import { BodyDiagramCard } from "@/components/medical-dashboard/body-diagram-card";
import { ClinicianCard } from "@/components/medical-dashboard/clinician-card";
import { EventDetailsModal } from "@/components/medical-dashboard/event-details-modal";
import { PatientInfoCard } from "@/components/medical-dashboard/patient-info-card";
import { PolicyInfoCard } from "@/components/medical-dashboard/policy-info-card";
import { StatusInfoCard } from "@/components/medical-dashboard/status-info-card";
import { TimelineTrack } from "@/components/medical-dashboard/timeline-track";
import { VitalSignsWaveformCard } from "@/components/vital-signs-waveform-card";

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
  const { isAlert, setIsAlert } = useAlertState();
  const [vitalSigns, setVitalSigns] = useState<VitalSignsState>(
    createInitialVitalSigns,
  );
  const ecgSamplesRef = useRef<number[]>([]);
  const respiratorySamplesRef = useRef<number[]>([]);
  const spo2SamplesRef = useRef<number[]>([]);
  const bloodPressureSamplesRef = useRef<number[]>([]);

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

  const handleEcgSample = useCallback(
    (value: number) => {
      const heartRate = Math.max(50, Math.round(value * 180));
      ecgSamplesRef.current.push(value);
      if (ecgSamplesRef.current.length > 200) {
        ecgSamplesRef.current = ecgSamplesRef.current.slice(-200);
      }

      const alertActive = heartRate >= alertThreshold;
      if (alertActive) {
        setIsAlert(true);
      }
    },
    [alertThreshold, setIsAlert],
  );

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

  return (
    <div
      className={`h-screen w-screen bg-background text-foreground p-5 overflow-hidden ${COLOR_TRANSITION_CLASS}`}
    >
      <div
        className={`grid h-full gap-1.5 ${PANEL_TRANSITION_CLASS}`}
        style={{
          gridTemplateColumns: "240px 1fr 280px",
          gridTemplateRows:
            "2rem minmax(4.5rem, auto) repeat(7, minmax(0, 1fr)) auto 2rem",
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
        />

        <BodyDiagramCard
          onActivateAlert={() => {
            setIsAlert(true);
          }}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "3 / 7" }}
        />

        <PatientInfoCard
          patient={data.patient}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "7 / 8" }}
        />

        <AlertNotesCard
          config={data.alert}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 1, gridRow: "8 / 10" }}
        />

        <div
          className={`px-1.5 py-1.5 ${PANEL_TRANSITION_CLASS}`}
          style={{ gridColumn: 2, gridRow: 2 }}
        >
          <div className={`grid grid-cols-8 gap-3 ${COLOR_TRANSITION_CLASS}`}>
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
                alert={isAlert}
                large
              />
            </div>
            <VitalSign
              label="SpO2"
              value={`${vitalSigns.spo2}%`}
              avg={`${vitalSigns.spo2Avg}%`}
            />
            <VitalSign
              label="BP"
              value={vitalSigns.bloodPressure.systolic.toString()}
              subValue={vitalSigns.bloodPressure.diastolic.toString()}
              avg={`${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`}
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
              onSample={handleBloodPressureSample}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="blood-volume"
              config={WAVEFORM_CARD_CONFIG["blood-volume"]}
              label="Pleth"
              showDelta={true}
              style={{ height: "100%" }}
              onSample={handleBloodVolumeSample}
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
              onSample={handleEcgSample}
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
              onSample={handleEcgSample}
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
              onSample={handleBloodOxygenSample}
            />
          </div>
          <div className={`${PANEL_TRANSITION_CLASS} h-full`}>
            <VitalSignsWaveformCard
              chartId="placeholder-1"
              config={WAVEFORM_CARD_CONFIG["blood-oxygenation"]}
              label=""
              unit="%"
              style={{ height: "100%" }}
              onSample={handleBloodOxygenSample}
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
            onSample={handleEcgSample}
          />
        </div>

        <StatusInfoCard
          content={data.status}
          className={PANEL_TRANSITION_CLASS}
          style={{ gridColumn: 3, gridRow: 2 }}
        />

        <div
          className={`flex gap-1.5 ${PANEL_TRANSITION_CLASS}`}
          style={{ gridColumn: 3, gridRow: "3 / 8" }}
        >
          <AIInformationCard
            insight={data.aiInsight}
            className={PANEL_TRANSITION_CLASS}
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
        />

        <div
          className={`bg-background -mx-5 -mb-5 ${COLOR_TRANSITION_CLASS}`}
          style={{ gridColumn: "1 / 4", gridRow: 11 }}
        />
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function VitalSign({
  label,
  value,
  subValue,
  avg,
  alert,
  large,
}: {
  label: string;
  value: string;
  subValue?: string;
  avg: string;
  alert?: boolean;
  large?: boolean;
}) {
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
