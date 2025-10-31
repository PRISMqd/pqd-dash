import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Telemetry Summary</CardTitle>
        <CardDescription>Latest patient vitals and alerts.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Heart Rate</span>
          <span className="font-semibold">88 bpm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SpO₂</span>
          <span className="font-semibold">97%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Respiration</span>
          <span className="font-semibold">18 br/min</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          Dismiss
        </Button>
        <Button size="sm">View Details</Button>
      </CardFooter>
    </Card>
  ),
};
