"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Radio } from "@/components/ui/radio";
import { cn } from "@/lib/cn";
import { HOSPITALS, SPECIALTIES, hospitalName } from "@/lib/find-doctor/doctors";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

export type FilterDraft = { specialty: string; hospital: string };

type PanelProps = {
  draft: FilterDraft;
  onDraftChange: (draft: FilterDraft) => void;
  /** How many doctors the draft selection would show ("4 doctors match your filters"). */
  matchCount: number;
  /** Apply the draft and close ("Show 4 Doctors"). */
  onApply: () => void;
  /** Reset the draft selection ("Clear Filters"). */
  onClear: () => void;
  onClose: () => void;
};

const SPECIALTY_OPTIONS = [{ value: "", label: "All Specialties" }].concat(
  SPECIALTIES.map((s) => ({ value: s, label: s })),
);
const HOSPITAL_OPTIONS = [{ value: "", label: "All Hospitals" }].concat(
  HOSPITALS.map((h) => ({ value: h, label: hospitalName(h) })),
);

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? options[0].label;

const matchLabel = (count: number) =>
  `${count} ${count === 1 ? "doctor matches" : "doctors match"} your filters`;
const showLabel = (count: number) => `Show ${count} ${count === 1 ? "Doctor" : "Doctors"}`;

/* -------------------------------------------------------------------------------------------- */
/* Desktop — "Filters Panel" Figma 61:4044 (600px popover under the search row)                   */
/* -------------------------------------------------------------------------------------------- */

type Category = "specialty" | "hospital";

/**
 * Desktop filters panel: a header ("Filters" + "Clear Filters"), a category list on the left
 * (Specialty / Hospital Name, each showing its current choice) with single-select radios on the
 * right, and a footer with the live match count and "Show N Doctors". A non-modal popover:
 * Esc, a click outside, or applying closes it.
 */
export function FiltersPopover({
  draft,
  onDraftChange,
  matchCount,
  onApply,
  onClear,
  onClose,
  triggerRef,
  id,
}: PanelProps & { triggerRef: RefObject<HTMLElement | null>; id: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [category, setCategory] = useState<Category>("specialty");

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose, triggerRef]);

  // Put keyboard focus on the current choice when the panel opens.
  useEffect(() => {
    panelRef.current?.querySelector<HTMLInputElement>("input[type=radio]:checked")?.focus();
  }, []);

  const isSpecialty = category === "specialty";
  const options = isSpecialty ? SPECIALTY_OPTIONS : HOSPITAL_OPTIONS;
  const value = isSpecialty ? draft.specialty : draft.hospital;

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-[600px] flex-col overflow-hidden rounded-xsm border border-pneutral-200 bg-white"
    >
      <div className="flex items-center justify-between border-b border-pneutral-200 py-3 pl-5 pr-3">
        <h2 id={titleId} className="font-heading text-typo-lg font-semibold text-pneutral-900">
          Filters
        </h2>
        <Button variant="text" size="md" shape="rounded" onClick={onClear}>
          Clear Filters
        </Button>
      </div>

      <div className="flex items-start">
        <div role="group" aria-label="Filter by" className="flex w-[200px] shrink-0 flex-col self-stretch bg-pneutral-50 py-2">
          {(
            [
              { key: "specialty", title: "Specialty", current: labelOf(SPECIALTY_OPTIONS, draft.specialty) },
              { key: "hospital", title: "Hospital Name", current: labelOf(HOSPITAL_OPTIONS, draft.hospital) },
            ] as { key: Category; title: string; current: string }[]
          ).map(({ key, title, current }) => {
            const active = category === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(key)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 py-3 pr-4 text-left outline-none transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-700",
                  active
                    ? "border-l-[3px] border-secondary-700 bg-white pl-5"
                    : "pl-5 hover:bg-secondary-50",
                )}
              >
                <span
                  className={cn(
                    "text-typo-md font-semibold",
                    active
                      ? "font-heading text-secondary-800"
                      : "font-paragraph text-pneutral-900",
                  )}
                >
                  {title}
                </span>
                <span className="font-paragraph text-typo-sm text-pneutral-700">{current}</span>
              </button>
            );
          })}
        </div>

        <div role="radiogroup" aria-labelledby={`${id}-options`} className="flex min-w-0 flex-1 flex-col gap-3 px-5 py-4">
          <p id={`${id}-options`} className="font-heading text-typo-md font-semibold text-pneutral-900">
            {isSpecialty ? "Select Specialty" : "Select Hospital"}
          </p>
          {options.map((option) => (
            <Radio
              key={option.value || "all"}
              name={`${id}-${category}`}
              value={option.value}
              label={option.label}
              checked={value === option.value}
              onChange={(next) =>
                onDraftChange(isSpecialty ? { ...draft, specialty: next } : { ...draft, hospital: next })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-pneutral-200 py-3 pl-5 pr-3">
        <p role="status" className="font-paragraph text-typo-md text-pneutral-700">
          {matchLabel(matchCount)}
        </p>
        <Button size="md" shape="rounded" onClick={onApply}>
          {showLabel(matchCount)}
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Mobile — "Mobile Filter Sheet" Figma 121:15953 (bottom sheet)                                  */
/* -------------------------------------------------------------------------------------------- */

function SheetGroup({
  title,
  name,
  options,
  value,
  onChange,
}: {
  title: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="flex w-full flex-col gap-1">
      <p id={labelId} className="font-heading text-typo-sm font-semibold uppercase text-secondary-700">
        {title}
      </p>
      {options.map((option) => (
        <Radio
          key={option.value || "all"}
          name={name}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          onChange={onChange}
          className="py-1"
        />
      ))}
    </div>
  );
}

/**
 * Mobile filters sheet: both groups (SPECIALTY, HOSPITAL NAME) in one scrolling list, the live
 * match count, and "Clear Filters" + "Show N Doctors" at the bottom. Modal: focus is trapped,
 * Esc / the close button / the scrim dismiss, and the page behind can't scroll.
 */
export function FiltersSheet({
  draft,
  onDraftChange,
  matchCount,
  onApply,
  onClear,
  onClose,
}: PanelProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useBodyScrollLock(true);
  useFocusTrap(sheetRef, true, { onEscape: onClose });

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:hidden">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-pneutral-900/48" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-60px)] w-full flex-col items-center rounded-t-xxlg bg-white pt-3 outline-none"
      >
        <span aria-hidden="true" className="h-1 w-10 shrink-0 rounded-full bg-pneutral-300" />
        <div className="flex w-full shrink-0 items-center gap-2 border-b border-pneutral-200 px-4 py-3">
          <h2 id={titleId} className="min-w-0 flex-1 font-heading text-h6 font-semibold text-pneutral-900">
            Filters
          </h2>
          <Button
            variant="text"
            size="sm"
            shape="pill"
            iconOnly
            icon="x-mark-sm"
            aria-label="Close filters"
            onClick={onClose}
          />
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto p-4">
          <SheetGroup
            title="Specialty"
            name="sheet-specialty"
            options={SPECIALTY_OPTIONS}
            value={draft.specialty}
            onChange={(specialty) => onDraftChange({ ...draft, specialty })}
          />
          <SheetGroup
            title="Hospital Name"
            name="sheet-hospital"
            options={HOSPITAL_OPTIONS}
            value={draft.hospital}
            onChange={(hospital) => onDraftChange({ ...draft, hospital })}
          />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 border-t border-pneutral-200 px-4 pb-6 pt-3">
          <p role="status" className="font-heading text-typo-sm text-pneutral-700">
            {matchLabel(matchCount)}
          </p>
          <div className="flex w-full items-start gap-3">
            <Button
              variant="outlined"
              tone="secondary"
              shape="pill"
              onClick={onClear}
              className="w-[128px]"
            >
              Clear Filters
            </Button>
            <Button shape="pill" onClick={onApply} className="flex-1">
              {showLabel(matchCount)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
