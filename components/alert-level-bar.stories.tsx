import type { Meta, StoryObj } from "@storybook/react";
import { AlertStateProvider } from "@/components/alert-state-context";
import { AlertLevelBar } from "@/components/alert-level-bar";

const meta: Meta<typeof AlertLevelBar> = {
  title: "Monitoring/AlertLevelBar",
  component: AlertLevelBar,
  args: {
    level: 60,
    className: "h-40",
    alert: false,
  },
  argTypes: {
    level: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    alert: {
      control: { type: "boolean" },
      description: "Wraps the bar in AlertStateProvider to show alert fill",
    },
  },
  decorators: [
    (Story, context) => (
      <AlertStateProvider initialAlert={context.args.alert ?? false}>
        <div className="flex h-48 items-end justify-center bg-card/40 p-6">
          <Story />
        </div>
      </AlertStateProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AlertLevelBar>;

export const Medium: Story = {};

export const High: Story = {
  args: {
    level: 90,
    className: "h-40",
  },
};

export const Low: Story = {
  args: {
    level: 25,
    className: "h-40",
  },
};

export const AlertActive: Story = {
  args: {
    level: 75,
    alert: true,
    className: "h-40",
  },
};
