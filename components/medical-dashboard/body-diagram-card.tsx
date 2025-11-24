"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BODY_DIAGRAM_IMAGE_STYLE: CSSProperties = {
  objectFit: "cover",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
};

export function BodyDiagramCard({
  onActivateAlert,
  className,
  style,
  onClick,
  isActive,
  unoptimizedImage,
}: {
  onActivateAlert: () => void;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  unoptimizedImage?: boolean;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "bg-transparent border-[#3F6E67]/40 p-0 flex items-center justify-center w-full h-full min-h-[300px] overflow-hidden",
        onClick &&
          "cursor-pointer hover:border-primary/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0",
        isActive && "border-primary/80 shadow-[0_6px_16px_rgba(0,0,0,0.35)] bg-[#d6e8e3]",
        className,
      )}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isActive ?? false : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        suppressHydrationWarning
      >
        <Image
          src="/images/body-diagram.svg"
          alt="Side profile torso with lead locations"
          fill
          priority
          suppressHydrationWarning
          unoptimized={unoptimizedImage}
          style={BODY_DIAGRAM_IMAGE_STYLE}
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 200px, 100vw"
        />
        <button
          type="button"
          className="absolute top-[45%] left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition-opacity border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-8 h-8 bg-[#C22D4D] [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] animate-[pulse_1s_cubic-bezier(0.4,0,_0.6,1)_infinite]"
          onClick={(event) => {
            event.stopPropagation();
            onActivateAlert();
          }}
          aria-label="Highlight chest alert"
        />
      </div>
    </Card>
  );
}
