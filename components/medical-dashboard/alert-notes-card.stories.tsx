import type { Meta, StoryObj } from "@storybook/react";
import { AlertStateProvider } from "@/components/alert-state-context";
import { AlertNotesCard } from "@/components/medical-dashboard/alert-notes-card";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

const mockData = createMockMedicalDashboardData();

const meta: Meta<typeof AlertNotesCard> = {
  title: "Medical Dashboard/AlertNotesCard",
  component: AlertNotesCard,
  args: {
    config: mockData.alert,
  },
  argTypes: {
    config: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof AlertNotesCard>;

export const ShowingAlert: Story = {
  render: (args) => (
    <AlertStateProvider initialAlert>
      <AlertNotesCard {...args} />
    </AlertStateProvider>
  ),
};

export const ShowingNotes: Story = {
  render: (args) => (
    <AlertStateProvider initialAlert={false}>
      <AlertNotesCard {...args} />
    </AlertStateProvider>
  ),
};
