"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { slotCountLabel, type DateChipData } from "@/lib/booking/availability";
import { formatSpokenDate } from "@/lib/booking/dates";

/**
 * Figma "Date Chip" (98:6665): Available (white, neutral-200 border, purple slot count), Selected
 * (primary-800 fill, white text) and Unavailable (neutral-50, greyed, not selectable).
 */
function DateChip({
  chip,
  name,
  checked,
  onSelect,
}: {
  chip: DateChipData;
  name: string;
  checked: boolean;
  onSelect: (date: string) => void;
}) {
  const unavailable = chip.available === 0;
  const count = slotCountLabel(chip.available);
  return (
    <label
      data-date={chip.date}
      className={cn(
        // `relative` contains the visually hidden radio; otherwise it escapes the scroller's
        // clipping and widens the whole page.
        "relative flex w-24 shrink-0 flex-col items-center gap-1 rounded-sm border px-2 py-3 font-heading lg:w-auto lg:min-w-24 lg:flex-1",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary-700",
        unavailable
          ? "cursor-not-allowed border-pneutral-200 bg-pneutral-50 text-pneutral-300"
          : checked
            ? "cursor-pointer border-primary-800 bg-primary-800 text-white"
            : "cursor-pointer border-pneutral-200 bg-white transition-colors duration-150 hover:border-primary-800",
      )}
    >
      <input
        type="radio"
        name={name}
        value={chip.date}
        checked={checked}
        disabled={unavailable}
        onChange={() => onSelect(chip.date)}
        aria-label={`${formatSpokenDate(chip.date)}, ${count}`}
        className="sr-only"
      />
      <span aria-hidden="true" className={cn("text-typo-sm font-medium", !unavailable && !checked && "text-pneutral-700")}>
        {chip.day}
      </span>
      <span aria-hidden="true" className={cn("text-h5 font-medium", !unavailable && !checked && "text-pneutral-900")}>
        {chip.dayOfMonth}
      </span>
      <span aria-hidden="true" className={cn("text-typo-sm", !unavailable && !checked && "text-pneutral-700")}>
        {chip.month}
      </span>
      <span aria-hidden="true" className={cn("text-typo-sm font-medium", !unavailable && !checked && "text-primary-800")}>
        {count}
      </span>
    </label>
  );
}

/**
 * The seven-day "Date Strip". Desktop: the chips share the row (96px each at 1440). Mobile and
 * narrow desktops: 96px chips in a row that scrolls sideways, bleeding to the screen edge.
 * A radio group, so arrow keys move between the available days.
 */
export function DateStrip({
  chips,
  value,
  onChange,
  labelledBy,
  describedBy,
}: {
  chips: DateChipData[];
  value: string | null;
  onChange: (date: string) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Keep the selected day in view when the strip scrolls.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.querySelector<HTMLElement>(`[data-date="${value}"]`);
    if (!strip || !chip || strip.scrollWidth <= strip.clientWidth) return;
    const left = chip.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + chip.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
    }
  }, [value, chips]);

  return (
    <div
      ref={stripRef}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="-mr-4 flex gap-2 overflow-x-auto pr-4 [scrollbar-width:none] lg:mr-0 lg:pr-0 [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => (
        <DateChip
          key={chip.date}
          chip={chip}
          name="appointment-date"
          checked={chip.date === value}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
