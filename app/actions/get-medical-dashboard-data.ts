"use server";

import type { MedicalDashboardData } from "@/components/medical-dashboard/types";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

export async function getMedicalDashboardData(): Promise<MedicalDashboardData> {
  // In production this action would aggregate telemetry, EHR data, and policy
  // guidance. For now we serve deterministic mock data from the DAL.
  return createMockMedicalDashboardData();
}
