"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type ChoiceCardProps = {
  /** Id of the radio input (so an error can move focus to it). */
  id?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Figma "Choice Card" (98:6647) — one option of a single-choice group (Consultation Type,
 * Consultation Mode, Booking for…). 12px radius, 16px padding, radio circle + title (Work Sans
 * semibold 16/24) and description (12/18). Selected: lavender fill with a 2px primary-800 border;
 * otherwise white with a 1px neutral-300 border. Figma counts the stroke in the card's size,
 * as CSS does. A visually hidden native radio carries the semantics, so arrow keys move through
 * the group; hover and the focus ring are derived.
 */
export function ChoiceCard({
  id: idProp,
  name,
  value,
  checked,
  onChange,
  title,
  description,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-sm p-4 transition-colors duration-150",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary-700",
        checked
          ? "border-2 border-primary-800 bg-secondary-50"
          : "border border-pneutral-300 bg-white hover:border-pneutral-500",
        disabled && "cursor-not-allowed opacity-60 hover:border-pneutral-300",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        className="sr-only"
      />
      <Icon name={checked ? "radio-on" : "radio-off"} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span id={`${id}-title`} className="font-heading text-typo-lg font-semibold text-pneutral-900">
          {title}
        </span>
        {description && (
          <span id={`${id}-description`} className="font-heading text-typo-sm text-pneutral-700">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
