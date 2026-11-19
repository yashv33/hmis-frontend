"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  WEEKDAYS_LONG,
  WEEKDAYS_MIN,
  addDays,
  addMonths,
  formatMonthYear,
  formatSpokenDate,
  parseISODate,
  sameMonth,
  startOfMonth,
  toISODate,
} from "@/lib/booking/dates";
import { Icon } from "./icon";

type CalendarProps = {
  /** Any date in the month to show first. */
  initialMonth: Date;
  minMonth: Date;
  maxMonth: Date;
  today: string;
  selected: string | null;
  isAvailable: (iso: string) => boolean;
  onSelect: (iso: string) => void;
  /** Buttons row under the grid (Figma: Cancel / Done). */
  footer?: ReactNode;
  className?: string;
};

/** Inner bevel of the Figma "Buttons-control" (white) and "Btn-inner" (filled) buttons. */
export const CONTROL_SHADOW = "shadow-[inset_0_0_1px_0_var(--color-sneutral-100)]";
export const FILLED_CONTROL_SHADOW =
  "shadow-[inset_0_12px_12px_0_rgba(255,255,255,0.12),inset_0_-2px_2px_0_rgba(48,48,48,0.1)]";

/** Weeks (Sunday first) covering the month, padded with the neighbouring months' days. */
function monthWeeks(month: Date) {
  const first = startOfMonth(month);
  const start = addDays(first, -first.getDay());
  const weeks: Date[][] = [];
  for (let cursor = start; weeks.length < 6; ) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    if (weeks.length > 0 && !sameMonth(week[0], month)) break;
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

/**
 * Figma "Calendar" date picker (G-01.02 calendar overlay): month header with previous / next
 * buttons, Su–Sa row, 36px day cells. Days without slots, past days and other months' days are
 * drawn in secondary-100; today has a 2px gold ring; the selected day is filled primary-900.
 *
 * Accessible grid: one day is tabbable at a time; arrow keys move by day / week, Home / End to
 * the start / end of the week, Page Up / Page Down by month. Enter or Space picks an available day.
 */
export function Calendar({
  initialMonth,
  minMonth,
  maxMonth,
  today,
  selected,
  isAvailable,
  onSelect,
  footer,
  className,
}: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(initialMonth));
  const [focusDate, setFocusDate] = useState(() => selected ?? today);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const labelId = useId();

  const canGoBack = month > startOfMonth(minMonth);
  const canGoForward = month < startOfMonth(maxMonth);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, month]);

  const goToMonth = (next: Date) => {
    setMonth(next);
    const focused = parseISODate(focusDate);
    if (!sameMonth(focused, next)) {
      const day = Math.min(focused.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
      setFocusDate(toISODate(new Date(next.getFullYear(), next.getMonth(), day)));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = parseISODate(focusDate);
    let next: Date | null = null;
    switch (event.key) {
      case "ArrowLeft":
        next = addDays(current, -1);
        break;
      case "ArrowRight":
        next = addDays(current, 1);
        break;
      case "ArrowUp":
        next = addDays(current, -7);
        break;
      case "ArrowDown":
        next = addDays(current, 7);
        break;
      case "Home":
        next = addDays(current, -current.getDay());
        break;
      case "End":
        next = addDays(current, 6 - current.getDay());
        break;
      case "PageUp":
      case "PageDown": {
        const target = addMonths(current, event.key === "PageUp" ? -1 : 1);
        const day = Math.min(current.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate());
        next = new Date(target.getFullYear(), target.getMonth(), day);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
    if (next < startOfMonth(minMonth) || next >= addMonths(maxMonth, 1)) return;
    moveFocus.current = true;
    if (!sameMonth(next, month)) setMonth(startOfMonth(next));
    setFocusDate(toISODate(next));
  };

  const navButton = (direction: "prev" | "next") => {
    const enabled = direction === "prev" ? canGoBack : canGoForward;
    return (
      <button
        type="button"
        aria-label={direction === "prev" ? "Previous month" : "Next month"}
        disabled={!enabled}
        onClick={() => goToMonth(addMonths(month, direction === "prev" ? -1 : 1))}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xsm border border-pneutral-200 bg-white outline-none transition-colors duration-150",
          FILLED_CONTROL_SHADOW,
          "hover:bg-pneutral-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary-700",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
        )}
      >
        <Icon name={direction === "prev" ? "calendar-prev" : "calendar-next"} />
      </button>
    );
  };

  return (
    // Figma draws the 1px border inside the 16px padding: 15px + border here (284px wide).
    <div
      className={cn(
        "flex w-[284px] flex-col items-center gap-2 rounded-xsm border border-pneutral-200 bg-white p-[15px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex h-8 w-[252px] items-center justify-center gap-px">
        {navButton("prev")}
        <p
          id={labelId}
          aria-live="polite"
          className="min-w-0 flex-1 text-center font-paragraph text-typo-md font-medium text-pneutral-900"
        >
          {formatMonthYear(month)}
        </p>
        {navButton("next")}
      </div>

      <div ref={gridRef} role="grid" aria-labelledby={labelId} onKeyDown={onKeyDown} className="flex w-[252px] flex-col gap-2">
        <div role="row" className="flex">
          {WEEKDAYS_MIN.map((day, index) => (
            <span
              key={day}
              role="columnheader"
              aria-label={WEEKDAYS_LONG[index]}
              className="flex h-9 flex-1 items-center justify-center font-paragraph text-typo-md text-pneutral-400"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {monthWeeks(month).map((week) => (
            <div key={toISODate(week[0])} role="row" className="flex">
              {week.map((day) => {
                const iso = toISODate(day);
                const inMonth = sameMonth(day, month);
                if (!inMonth) {
                  return (
                    <span
                      key={iso}
                      role="gridcell"
                      aria-hidden="true"
                      className="flex h-9 flex-1 items-center justify-center font-paragraph text-typo-md font-medium text-secondary-100"
                    >
                      {day.getDate()}
                    </span>
                  );
                }
                const available = isAvailable(iso);
                const isSelected = iso === selected;
                const isToday = iso === today;
                return (
                  <span key={iso} role="gridcell" aria-selected={isSelected} className="flex flex-1">
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={iso === focusDate ? 0 : -1}
                      aria-label={`${formatSpokenDate(iso)}${isToday ? ", today" : ""}${available ? "" : ", no slots"}`}
                      aria-disabled={!available || undefined}
                      onClick={() => {
                        setFocusDate(iso);
                        if (available) onSelect(iso);
                      }}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && !available) event.preventDefault();
                      }}
                      className={cn(
                        "flex h-9 flex-1 items-center justify-center rounded-xsm font-paragraph text-typo-md font-medium outline-none transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-700",
                        isSelected
                          ? "bg-primary-900 text-white"
                          : available
                            ? "text-pneutral-900 hover:bg-secondary-50"
                            : "cursor-default text-secondary-100",
                        isToday && !isSelected && "border-2 border-danger-600",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {footer && (
        // Figma draws the divider inside the row: 11px + 1px border.
        <div className="flex w-full items-end justify-end gap-[6px] border-t border-pneutral-200 pt-[11px]">
          {footer}
        </div>
      )}
    </div>
  );
}
