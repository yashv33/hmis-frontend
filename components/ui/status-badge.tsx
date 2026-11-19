import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "danger" | "warning";

const TONES: Record<Tone, { bg: string; dot: string }> = {
  success: { bg: "bg-success-50", dot: "bg-success-500" },
  /** Red: "Not Eligible". */
  danger: { bg: "bg-warning-50", dot: "bg-warning-600" },
  /** Yellow: "Verification Required", "Pending". */
  warning: { bg: "bg-danger-50", dot: "bg-danger-500" },
};

/**
 * Figma "Status Badge" (128:23842): a full-radius pill — 8px status dot, 12/18 semibold label,
 * 8px left / 12px right padding. The label carries the meaning; colour only reinforces it.
 */
export function StatusBadge({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  /** The compact "Verified" tag next to a mobile number has no dot. */
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full py-1 font-heading text-typo-sm font-semibold text-pneutral-900",
        dot ? "pl-2 pr-3" : "px-2",
        TONES[tone].bg,
        className,
      )}
    >
      {dot && <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", TONES[tone].dot)} />}
      {children}
    </span>
  );
}
