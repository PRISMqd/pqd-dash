import type { Meta, StoryObj } from "@storybook/react";
import { withReactContext } from "storybook-react-context/dist/decorator.js";
import { AlertStateContext } from "@/components/alert-state-context";
import { AIInformationCard } from "@/components/medical-dashboard/ai-information-card";
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

type AIInformationStoryProps = React.ComponentProps<
  typeof AIInformationCard
> & {
  isAlert: boolean;
};

const meta = {
  title: "Medical Dashboard/AIInformationCard",
  component: AIInformationCard,
  decorators: [
    (Story) => (
      <div className="bg-[#afd4cf] text-[#1e2a28] p-4 w-[360px]">
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
    insight: mockData.aiInsight,
  },
  argTypes: {
    isAlert: {
      control: { type: "boolean" },
      description: "Toggle the alert state context",
    },
    insight: {
      control: "object",
      description: "AI insight content (headline, details, recommendations)",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<AIInformationStoryProps>;

export default meta;
type Story = StoryObj<AIInformationStoryProps>;

export const Default: Story = {
  render: ({ isAlert: _unused, ...props }) => <AIInformationCard {...props} />,
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
  render: ({ isAlert: _unused, ...props }) => <AIInformationCard {...props} />,
};
