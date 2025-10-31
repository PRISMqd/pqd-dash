import type { Meta, StoryObj } from "@storybook/react";
import { withReactContext } from "storybook-react-context/dist/decorator.js";
import { AlertStateContext } from "@/components/alert-state-context";
import { AlertSurfaceCard } from "@/components/medical-dashboard/alert-surface-card";

type ContextFactoryArgs = {
  args?: { isAlert?: boolean };
  updateArgs: (nextArgs: { isAlert: boolean }) => void;
};

const createContextValue =
  (initial: boolean) =>
  ({ args, updateArgs }: ContextFactoryArgs) => {
    const current = typeof args?.isAlert === "boolean" ? args.isAlert : initial;

    return {
      isAlert: current,
      setIsAlert: (next: boolean | ((previous: boolean) => boolean)) => {
        const value = typeof next === "function" ? next(current) : next;
        updateArgs({ isAlert: value });
      },
    };
  };

type AlertSurfaceStoryProps = React.ComponentProps<typeof AlertSurfaceCard> & {
  isAlert: boolean;
};

const meta = {
  title: "Medical Dashboard/AlertSurfaceCard",
  component: AlertSurfaceCard,
  decorators: [
    withReactContext({
      context: AlertStateContext,
      contextValue: createContextValue(false),
    }),
  ],
  args: {
    isAlert: false,
    className: "p-4 max-w-xs",
  },
  argTypes: {
    isAlert: {
      control: { type: "boolean" },
      description: "Toggle the alert state context",
    },
    className: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<AlertSurfaceStoryProps>;

export default meta;
type Story = StoryObj<AlertSurfaceStoryProps>;

const Content = () => (
  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
    <p>
      Continuous ECG monitoring shows sustained tachycardia with occasional ST
      elevation. Nursing staff notified at 14:23.
    </p>
    <p>
      Awaiting repeat troponin panel and cardiology consult confirmation before
      transferring to the cath lab.
    </p>
  </div>
);

export const Default: Story = {
  render: ({ isAlert: _unused, ...props }) => (
    <AlertSurfaceCard {...props}>
      <Content />
    </AlertSurfaceCard>
  ),
};

export const AlertState: Story = {
  args: {
    isAlert: true,
  },
  parameters: {
    reactContext: {
      contextValue: createContextValue(true),
    },
  },
  render: ({ isAlert: _unused, ...props }) => (
    <AlertSurfaceCard {...props}>
      <Content />
    </AlertSurfaceCard>
  ),
};
