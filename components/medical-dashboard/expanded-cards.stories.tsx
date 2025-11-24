import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertNotesExpanded,
  AIExpanded,
  BodyDiagramExpanded,
  PatientExpanded,
  PolicyExpanded,
  StatusExpanded,
  ClinicianExpandedCard,
} from "@/components/medical-dashboard";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

const mock = createMockMedicalDashboardData();

const meta: Meta = {
  title: "Medical Dashboard/Expanded Cards",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-[#afd4cf] text-[#1e2a28] p-4 min-h-screen w-screen flex items-start justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const ClinicianExpanded: StoryObj = {
  render: () => (
    <ClinicianExpandedCard clinician={mock.clinician} onClose={() => {}} />
  ),
};

export const BodyDiagramExpandedStory: StoryObj = {
  render: () => <BodyDiagramExpanded onClose={() => {}} />,
};

export const PatientExpandedStory: StoryObj = {
  render: () => <PatientExpanded patient={mock.patient} onClose={() => {}} />,
};

export const AlertNotesExpandedStory: StoryObj = {
  render: () => <AlertNotesExpanded config={mock.alert} onClose={() => {}} />,
};

export const StatusExpandedStory: StoryObj = {
  render: () => <StatusExpanded content={mock.status} onClose={() => {}} />,
};

export const AIExpandedStory: StoryObj = {
  render: () => <AIExpanded insight={mock.aiInsight} onClose={() => {}} />,
};

export const PolicyExpandedStory: StoryObj = {
  render: () => <PolicyExpanded policy={mock.policy} onClose={() => {}} />,
};
