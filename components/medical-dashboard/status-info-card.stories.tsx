import type { Meta, StoryObj } from "@storybook/react";
import { AlertStateProvider } from "@/components/alert-state-context";
import { StatusInfoCard } from "@/components/medical-dashboard/status-info-card";
import { createMockMedicalDashboardData } from "@/lib/dal/mock-medical-dashboard";

const mockData = createMockMedicalDashboardData();

type StatusInfoStoryProps = React.ComponentProps<typeof StatusInfoCard> & {
  isAlert: boolean;
};

const meta = {
  title: "Medical Dashboard/StatusInfoCard",
  component: StatusInfoCard,
  decorators: [
    (Story, context) => (
      <AlertStateProvider initialAlert={context.args.isAlert ?? false}>
        <div className="bg-[#afd4cf] text-[#1e2a28] p-4 w-[320px]">
          <Story />
        </div>
      </AlertStateProvider>
    ),
  ],
  args: {
    isAlert: false,
    content: mockData.status,
    maxContentHeight: "8rem",
    minContentHeight: "3.5rem",
  },
  argTypes: {
    isAlert: {
      control: { type: "boolean" },
      description: "Toggle the alert state context",
    },
    content: {
      control: "object",
      description: "Status panel content (summary/actionLabel)",
    },
    maxContentHeight: {
      control: "text",
      description: "Max height for scrollable content area",
    },
    minContentHeight: {
      control: "text",
      description: "Min height for scrollable content area",
    },
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
  render: ({ isAlert: _unused, ...props }) => <StatusInfoCard {...props} />,
};
