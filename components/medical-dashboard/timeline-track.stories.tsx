import type { Meta, StoryObj } from "@storybook/react";
import { TimelineTrack } from "@/components/medical-dashboard/timeline-track";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

const NOOP = () => {};

const events = createMockMedicalDashboardData().timelineEvents;

const meta: Meta<typeof TimelineTrack> = {
  title: "Medical Dashboard/TimelineTrack",
  component: TimelineTrack,
  args: {
    events,
    onSelectEventAction: NOOP,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TimelineTrack>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <TimelineTrack {...args} />
    </div>
  ),
};
