import type { Meta, StoryObj } from "@storybook/react";
import { BodyDiagramCard } from "@/components/medical-dashboard/body-diagram-card";

const NOOP = () => {};

const meta: Meta<typeof BodyDiagramCard> = {
  title: "Medical Dashboard/BodyDiagramCard",
  component: BodyDiagramCard,
  args: {
    onActivateAlert: NOOP,
    unoptimizedImage: true,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof BodyDiagramCard>;

export const Default: Story = {
  render: (args) => (
    <div
      style={{ width: 260, height: 400 }}
      className="bg-[#afd4cf] text-[#1e2a28] p-2"
    >
      <BodyDiagramCard {...args} style={{ width: "100%", height: "100%" }} />
    </div>
  ),
};
