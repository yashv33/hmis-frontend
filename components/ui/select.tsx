import type { ChangeEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type Option = { value: string; label: string };

type SelectProps = {
  id: string;
  /** Visible label above the field. Omit it and pass `labelledBy` when a heading labels it. */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  /** Shown while nothing is chosen (a disabled first option); not in the designs. */
  placeholder?: string;
  required?: boolean;
  /** Inline error message; also switches the field to its error state. */
  error?: string;
  /**
   * md — 44px field derived from the Input tokens (Find a Doctor sort / filters).
   * lg — Figma ".Input-Size" dropdown (G-01.02 Hospital Name, G-01.03 Relationship): 52px, 16px
   *      text, 24px chevron, the same label row as a text field (16/24 medium + red asterisk).
   */
  size?: "md" | "lg";
  className?: string;
};

const FIELD =
  "w-full cursor-pointer appearance-none border bg-white font-paragraph outline-none transition-[border-color,box-shadow] duration-150";
const FIELD_DEFAULT =
  "border-pneutral-300 hover:border-pneutral-500 focus-visible:border-secondary-300 focus-visible:shadow-[0_0_0_2px_var(--color-secondary-700)] focus-visible:hover:border-secondary-300";
const FIELD_ERROR =
  "border-warning-500 focus-visible:shadow-[0_0_0_1px_var(--color-warning-500),0_0_0_4px_var(--color-warning-50)]";

/**
 * Native `<select>` styled like the text fields (8px radius, neutral-300 border, secondary ring on
 * focus). A native element keeps keyboard and screen-reader behaviour for free; only the closed
 * state is drawn in Figma.
 */
export function Select({
  id,
  label,
  labelledBy,
  describedBy,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  size = "md",
  className,
}: SelectProps) {
  const large = size === "lg";
  const errorId = `${id}-error`;
  const hasError = Boolean(error);
  const describedByIds = [error ? errorId : undefined, describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col", large ? "gap-0" : "gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "flex items-center gap-1 font-heading font-medium text-pneutral-900",
            large ? "px-1 text-typo-lg" : "text-typo-md",
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="font-paragraph text-typo-md font-semibold text-warning-500">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          required={required}
          aria-labelledby={labelledBy}
          aria-describedby={describedByIds}
          aria-invalid={hasError || undefined}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
          className={cn(
            FIELD,
            hasError ? FIELD_ERROR : FIELD_DEFAULT,
            value === "" ? "text-pneutral-500" : "text-pneutral-900",
            // Figma draws the 1px stroke inside the 16px padding: 15px + border here.
            large
              ? "h-[52px] rounded-xsm pl-[15px] pr-[51px] text-typo-lg"
              : "h-11 rounded-xsm pl-3 pr-10 text-typo-md",
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-pneutral-900">
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name={large ? "select-chevron" : "sort-chevron"}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2",
            large ? "right-4" : "right-3",
          )}
        />
      </div>
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="flex items-center gap-1 px-1 font-heading text-typo-md text-warning-500">
            <span>{error}</span>
            <Icon name="exclamation-circle-outline" />
          </p>
        )}
      </div>
    </div>
  );
}
