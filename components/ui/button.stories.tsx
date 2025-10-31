import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Click me",
    variant: "default",
    size: "default",
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const GhostIcon: Story = {
  args: {
    variant: "ghost",
    size: "icon",
    children: "☰",
    "aria-label": "Menu",
  },
};
