import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, dependency-free hover tooltip.
 * Renders a small "i" badge; the detail panel appears on hover/focus.
 */
export default function HoverInfo({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className="group relative ml-1 inline-flex items-center align-middle">
      <span
        tabIndex={0}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border text-[10px] leading-none opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        i
      </span>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-left text-xs font-normal text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          className
        )}
      >
        {children}
      </span>
    </span>
  );
}
