"use client";

import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { cn } from "@/lib/utils";

type BaseProps = ComponentPropsWithoutRef<typeof Scrollbar>;

type ScrollAreaProps = {
  contentClassName?: string;
} & Omit<
  BaseProps,
  "contentProps" | "trackYProps" | "thumbYProps" | "noScrollX"
>;

export function ScrollArea({
  className,
  contentClassName,
  children,
  ...props
}: ScrollAreaProps) {
  const trackStyle: CSSProperties = { width: 8, margin: "4px 0" };

  return (
    <Scrollbar
      noScrollX
      className={cn("card-scrollbar", className)}
      contentProps={{
        className: cn(contentClassName),
      }}
      trackYProps={{
        className: "card-scrollbar-track",
        style: trackStyle,
      }}
      thumbYProps={{
        className: "card-scrollbar-thumb",
      }}
      {...props}
    >
      {children}
    </Scrollbar>
  );
}
