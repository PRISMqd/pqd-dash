import type { Meta, StoryObj } from "@storybook/react";
import { withReactContext } from "storybook-react-context/dist/decorator.js";
import { AlertStateContext } from "@/components/alert-state-context";
import { PolicyInfoCard } from "@/components/medical-dashboard/policy-info-card";
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

type PolicyInfoStoryProps = React.ComponentProps<typeof PolicyInfoCard> & {
  isAlert: boolean;
};

const meta = {
  title: "Medical Dashboard/PolicyInfoCard",
  component: PolicyInfoCard,
  decorators: [
    (Story) => (
      <div className="bg-[#afd4cf] text-[#1e2a28] p-4 w-[280px]">
        <Story />
      </div>
    ),
    withReactContext({
      context: AlertStateContext,
      contextValue: createContextValue(false),
    }),
  ],
  args: {
    isAlert: false,
    policy: mockData.policy,
  },
  argTypes: {
    isAlert: {
      control: { type: "boolean" },
      description: "Toggle the alert state context",
    },
    policy: {
      control: "object",
      description: "Policy reference content",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<PolicyInfoStoryProps>;

export default meta;
type Story = StoryObj<PolicyInfoStoryProps>;

export const Default: Story = {
  render: ({ isAlert: _unused, ...props }) => <PolicyInfoCard {...props} />,
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
  render: ({ isAlert: _unused, ...props }) => <PolicyInfoCard {...props} />,
};
