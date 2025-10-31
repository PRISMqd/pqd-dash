import type { Meta, StoryObj } from "@storybook/react";
import { ClinicianCard } from "@/components/medical-dashboard/clinician-card";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

const mockData = createMockMedicalDashboardData();

const meta: Meta<typeof ClinicianCard> = {
  title: "Medical Dashboard/ClinicianCard",
  component: ClinicianCard,
  args: {
    clinician: mockData.clinician,
  },
};

export default meta;
type Story = StoryObj<typeof ClinicianCard>;

export const Default: Story = {};

export const MultipleTeams: Story = {
  args: {
    clinician: {
      name: "Nguyen, Alex",
      teams: ["Critical Response", "Telemetry", "ICU Float"],
      status: "In Procedure",
      physician: "Dr. Raven Matthews",
      actionLabel: "Page",
    },
  },
};
