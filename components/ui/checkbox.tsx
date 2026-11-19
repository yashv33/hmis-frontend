import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
  label: ReactNode;
};

/**
 * Checkbox + label — Figma "Form Control / Checkbox" (20px, 4px radius, 1.5px
 * pneutral-200 border) with the "Remember me" label (14/20 Noto Sans).
 * Figma only draws the unchecked state; checked uses primary-800.
 */
export function Checkbox({ label, className, ...inputProps }: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 font-paragraph text-typo-md text-pneutral-900",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:text-pneutral-500",
        className,
      )}
    >
      <input
        {...inputProps}
        type="checkbox"
        className={cn(
          "relative size-5 shrink-0 cursor-pointer appearance-none rounded-[4px] border-[1.5px] border-pneutral-200 bg-white transition-colors",
          "hover:border-pneutral-500 checked:border-primary-800 checked:bg-primary-800",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700",
          "disabled:cursor-not-allowed disabled:border-pneutral-200 disabled:bg-pneutral-50",
          // Check mark
          "after:absolute after:left-[5.5px] after:top-[1px] after:h-[10px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:opacity-0 after:content-[''] checked:after:opacity-100",
        )}
      />
      {label}
    </label>
  );
}
