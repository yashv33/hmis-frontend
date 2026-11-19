"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/app/dialog";
import { CONTROL_SHADOW, FILLED_CONTROL_SHADOW, Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/cn";
import { dayAvailability, lastBookableDate } from "@/lib/booking/availability";
import { now, parseISODate, todayISO } from "@/lib/booking/dates";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";

const FOOTER_BUTTON =
  "flex h-8 items-center justify-center rounded-xsm p-2 font-paragraph text-typo-md font-medium outline-none transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

/**
 * "Choose an appointment date" — Figma G-01.02 Calendar overlays: a 332px centred dialog on desktop
 * (118:10273) and a bottom sheet on mobile (118:10510). Picking a day only marks it; "Done" applies
 * it, "Cancel", Esc or the scrim leave the date as it was.
 */
export function CalendarDialog({
  doctor,
  value,
  onDone,
  onClose,
}: {
  doctor: Doctor;
  value: string | null;
  onDone: (date: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [picked, setPicked] = useState(value);
  const today = todayISO();

  return (
    <Dialog onClose={onClose} labelledBy={titleId} describedBy={descriptionId} size="compact" placement="center">
      <div className="flex w-full flex-col gap-1">
        <h2 id={titleId} className="font-heading text-h6 font-semibold text-pneutral-900">
          Choose an appointment date
        </h2>
        <p id={descriptionId} className="font-heading text-typo-sm text-pneutral-700">
          <span className="hidden lg:inline">
            {doctor.name} · {hospitalName(doctor.hospital)}.{" "}
          </span>
          Greyed-out dates have no slots.
        </p>
      </div>
      <Calendar
        className="lg:self-center"
        initialMonth={parseISODate(picked ?? today)}
        minMonth={now()}
        maxMonth={parseISODate(lastBookableDate())}
        today={today}
        selected={picked}
        isAvailable={(iso) => dayAvailability(doctor, iso).available > 0}
        onSelect={setPicked}
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className={cn(FOOTER_BUTTON, CONTROL_SHADOW, "border border-pneutral-200 bg-white text-pneutral-900 hover:bg-pneutral-50")}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!picked}
              onClick={() => picked && onDone(picked)}
              className={cn(FOOTER_BUTTON, FILLED_CONTROL_SHADOW, "bg-primary-900 text-white hover:bg-primary-800 disabled:opacity-50")}
            >
              Done
            </button>
          </>
        }
      />
    </Dialog>
  );
}
