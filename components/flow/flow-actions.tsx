import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FlowActionsProps = {
  children: ReactNode;
  /** One full-width button on mobile / one left-aligned button on desktop (success screen). */
  single?: boolean;
};

/**
 * One element, two placements — Figma's desktop "Form Actions" and mobile
 * "Bottom Action Bar":
 *  mobile  — pinned to the bottom of the screen (fixed), 73px tall, padded for the
 *            home-indicator safe area
 *  desktop — the last row of the card, below a hairline, buttons spread apart
 * Put the secondary action first and give the primary one `flex-1 lg:flex-none`.
 */
export function FlowActions({ children, single = false }: FlowActionsProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-pneutral-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "lg:static lg:z-auto lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-6",
        single
          ? "flex-col lg:flex-row lg:items-center lg:justify-start"
          : "items-center lg:justify-between",
      )}
    >
      {children}
    </div>
  );
}
