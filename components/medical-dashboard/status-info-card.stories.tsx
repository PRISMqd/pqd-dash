import type { Meta, StoryObj } from "@storybook/react";
import { withReactContext } from "storybook-react-context/dist/decorator.js";
import { AlertStateContext } from "@/components/alert-state-context";
import { StatusInfoCard } from "@/components/medical-dashboard/status-info-card";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

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

const mockData = createMockMedicalDashboardData();

type StatusInfoStoryProps = React.ComponentProps<typeof StatusInfoCard> & {
  isAlert: boolean;
};

const meta = {
  title: "Medical Dashboard/StatusInfoCard",
  component: StatusInfoCard,
  decorators: [
    withReactContext({
      context: AlertStateContext,
      contextValue: createContextValue(false),
    }),
  ],
  args: {
    isAlert: false,
    content: mockData.status,
  },
  argTypes: {
    isAlert: {
      control: { type: "boolean" },
      description: "Toggle the alert state context",
    },
    content: { control: "object" },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<StatusInfoStoryProps>;

export default meta;
type Story = StoryObj<StatusInfoStoryProps>;

export const Default: Story = {
  render: ({ isAlert: _unused, ...props }) => <StatusInfoCard {...props} />,
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
  render: ({ isAlert: _unused, ...props }) => <StatusInfoCard {...props} />,
};
