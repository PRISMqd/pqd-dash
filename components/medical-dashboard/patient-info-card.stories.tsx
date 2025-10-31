import type { Meta, StoryObj } from "@storybook/react";
import { PatientInfoCard } from "@/components/medical-dashboard/patient-info-card";

const meta: Meta<typeof PatientInfoCard> = {
  title: "Medical Dashboard/PatientInfoCard",
  component: PatientInfoCard,
  args: {
    patient: {
      name: "Doe, Johnathon",
      sex: "M",
      birthDate: "6/11/75",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatientInfoCard>;

export const Default: Story = {};

export const FemalePatient: Story = {
  args: {
    patient: {
      name: "Smith, Avery",
      sex: "F",
      birthDate: "2/29/88",
    },
  },
};
