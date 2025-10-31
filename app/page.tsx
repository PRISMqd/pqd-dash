import { getMedicalDashboardData } from "@/app/actions/get-medical-dashboard-data";
import MedicalDashboard from "@/components/medical-dashboard";

export default async function Page() {
  const data = await getMedicalDashboardData();

  return <MedicalDashboard data={data} />;
}
