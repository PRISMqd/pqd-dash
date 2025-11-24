import type { Meta, StoryObj } from "@storybook/react";
import { TimelineTrack } from "@/components/medical-dashboard/timeline-track";

const NOOP = () => {};

const events = Array.from({ length: 10 }).map((_, index, arr) => ({
  id: index + 1,
  time: `${(index / (arr.length - 1)) * 100}%`,
  color: "bg-success",
  timestamp: `T${index + 1}`,
  type: "Telemetry",
  description: "Auto-generated telemetry marker",
  vitals: {},
}));

const meta: Meta<typeof TimelineTrack> = {
  title: "Medical Dashboard/TimelineTrack",
  component: TimelineTrack,
  args: {
    events,
    onSelectEventAction: NOOP,
    tickCount: 10,
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
