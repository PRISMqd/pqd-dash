import type { Meta, StoryObj } from "@storybook/react";
import { VitalSign } from "@/components/medical-dashboard";

const meta: Meta<typeof VitalSign> = {
  title: "Medical Dashboard/VitalSign",
  component: VitalSign,
  args: {
    label: "HR",
    value: "91",
    avg: "91",
    alert: false,
    large: true,
    glowBlur: 14,
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    subValue: { control: "text" },
    avg: { control: "text" },
    alert: { control: "boolean" },
    glowColor: { control: "color" },
    glowBlur: { control: { type: "range", min: 2, max: 30, step: 1 } },
  },
  parameters: {
    layout: "centered",
    backgrounds: { default: "dashboard" },
  },
};

export default meta;
type Story = StoryObj<typeof VitalSign>;

export const Default: Story = {};

export const ModerateAlert: Story = {
  args: {
    value: "105",
    avg: "91",
    alert: false,
    glowColor: "#f6db6e",
    glowBlur: 16,
  },
};

export const SevereAlert: Story = {
  args: {
    value: "150",
    avg: "91",
    alert: true,
    glowColor: "#d14d6c",
    glowBlur: 18,
  },
};
