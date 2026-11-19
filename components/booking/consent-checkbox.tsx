"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Figma "Consent Checkbox" (129:24989): a 24px control in secondary-300 — a lavender circle with a
 * 12px white dash while unchecked, a lavender rounded square with a white tick once checked —
 * 12px from 14/20 text. A real checkbox sits visually hidden on top; the focus ring is drawn on the control.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  children,
  invalid = false,
  describedBy,
  id: idProp,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
  describedBy?: string;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <label htmlFor={id} className="relative flex cursor-pointer items-start gap-3 font-paragraph text-typo-md text-pneutral-900">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center bg-secondary-300 transition-[border-radius] duration-150",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary-700",
          checked ? "rounded-[6px]" : "rounded-full",
          invalid && !checked && "ring-2 ring-warning-500",
        )}
      >
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7.5 5.6 10.5 11.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="h-[2px] w-3 rounded-full bg-white" />
        )}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
