"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { SlotGroup } from "@/lib/booking/availability";
import { formatTime } from "@/lib/booking/dates";

/**
 * Figma "Time Slot" (98:6674): 104px, 8px radius. Available (white, neutral-300 border), Selected
 * (primary-800 fill) and Unavailable (booked or blocked: neutral-50, greyed, not selectable).
 */
function TimeSlotOption({
  time,
  available,
  checked,
  name,
  onSelect,
}: {
  time: string;
  available: boolean;
  checked: boolean;
  name: string;
  onSelect: (time: string) => void;
}) {
  const label = formatTime(time);
  return (
    <label
      className={cn(
        "relative flex w-[104px] shrink-0 items-center justify-center rounded-xsm border px-4 py-3 font-heading text-typo-md font-medium",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary-700",
        !available
          ? "cursor-not-allowed border-pneutral-200 bg-pneutral-50 text-pneutral-300"
          : checked
            ? "cursor-pointer border-primary-800 bg-primary-800 text-white"
            : "cursor-pointer border-pneutral-300 bg-white text-pneutral-900 transition-colors duration-150 hover:border-primary-800",
      )}
    >
      <input
        type="radio"
        name={name}
        value={time}
        checked={checked}
        disabled={!available}
        onChange={() => onSelect(time)}
        aria-label={available ? label : `${label}, booked`}
        className="sr-only"
      />
      <span aria-hidden="true" className="whitespace-nowrap">
        {label}
      </span>
    </label>
  );
}

/**
 * Slots grouped as the design shows them (MORNING / AFTERNOON), 12px apart, wrapping — three per
 * row on a 375px screen. One radio group across all groups; selecting a time doesn't book it.
 */
export function TimeSlotPicker({
  groups,
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid = false,
}: {
  groups: SlotGroup[];
  value: string | null;
  onChange: (time: string) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required="true"
      className="flex flex-col gap-3"
    >
      {groups.map((group) => (
        <div key={group.id} role="group" aria-labelledby={`${id}-${group.id}`} className="flex flex-col gap-2">
          <p id={`${id}-${group.id}`} className="font-heading text-typo-sm font-semibold uppercase text-pneutral-700">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-3">
            {group.slots.map((slot) => (
              <TimeSlotOption
                key={slot.time}
                time={slot.time}
                available={slot.available}
                checked={slot.time === value}
                name="appointment-time"
                onSelect={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
