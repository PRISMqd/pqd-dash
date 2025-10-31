import type { Meta, StoryObj } from "@storybook/react";
import { EventDetailsModal } from "@/components/medical-dashboard/event-details-modal";

const NOOP = () => {};

const sampleEvent = {
  id: 1,
  time: "10%",
  color: "bg-destructive",
  timestamp: "14:23:15",
  type: "Critical Alert",
  description: "Heart rate exceeded threshold (150 bpm)",
  vitals: { hr: 150, bp: "125/85", spo2: "94%" },
};

const meta: Meta<typeof EventDetailsModal> = {
  title: "Medical Dashboard/EventDetailsModal",
  component: EventDetailsModal,
  args: {
    event: sampleEvent,
    onClose: NOOP,
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof EventDetailsModal>;

export const Default: Story = {};
