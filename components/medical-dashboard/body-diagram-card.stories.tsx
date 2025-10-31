import type { Meta, StoryObj } from "@storybook/react";
import { BodyDiagramCard } from "@/components/medical-dashboard/body-diagram-card";

const NOOP = () => {};

const meta: Meta<typeof BodyDiagramCard> = {
  title: "Medical Dashboard/BodyDiagramCard",
  component: BodyDiagramCard,
  args: {
    onActivateAlert: NOOP,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof BodyDiagramCard>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 360 }}>
      <BodyDiagramCard {...args} />
    </div>
  ),
};
