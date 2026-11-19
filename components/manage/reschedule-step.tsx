"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { CalendarDialog } from "@/components/booking/calendar-dialog";
import { DateStrip } from "@/components/booking/date-strip";
import { FieldHeading, FormActions } from "@/components/booking/form-parts";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { Button } from "@/components/ui/button";
import { dateEligibility, canReschedule } from "@/lib/appointments/rules";
import { dateStrip, dayAvailability } from "@/lib/booking/availability";
import {
  addDays,
  formatDate,
  formatMonthYear,
  formatTime,
  formatWeekdayDate,
  now,
  parseISODate,
  sameMonth,
  toISODate,
  todayISO,
} from "@/lib/booking/dates";
import { consultationModeLabel, consultationTypeLabel } from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { rescheduleStore } from "@/lib/manage/drafts";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import type { Appointment } from "@/lib/appointments/store";
import type { Doctor } from "@/lib/find-doctor/types";
import { ManagePage, Row, Rows } from "./manage-page";
import { NotAvailable } from "./not-available";

const TITLE = "Reschedule Appointment";

/** "November 2026", or "November – December 2026" when the strip crosses a month. */
function stripMonths(first: string, last: string) {
  const a = parseISODate(first);
  const b = parseISODate(last);
  if (sameMonth(a, b)) return formatMonthYear(a);
  return `${formatMonthYear(a).split(" ")[0]} – ${formatMonthYear(b)}`;
}

/**
 * Manage step 3 of 4 — Figma G-02.04 "Reschedule Appointment" (desktop 170:59668, mobile 170:60086;
 * Date Not Eligible 170:60254 / 170:60661). The current appointment, then a new date (the seven-day
 * strip or the calendar) and time. A follow-up or referral can only move inside its validity window:
 * a date outside it shows the red notice, hides the slots and keeps Continue disabled.
 */
export function RescheduleStep() {
  const guard = useManageGuard();
  if (!guard) return <BookingSkeleton step={3} title={TITLE} />;
  if (!canReschedule(guard.appointment)) {
    return <NotAvailable action="reschedule" appointment={guard.appointment} doctor={guard.doctor} />;
  }
  return <RescheduleForm appointment={guard.appointment} doctor={guard.doctor} />;
}

function RescheduleForm({ appointment, doctor }: { appointment: Appointment; doctor: Doctor }) {
  const router = useRouter();
  const ids = useId();
  const draft = rescheduleStore.useStore();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = todayISO();
  // Restore the choice when coming back from the review step.
  const stored = draft.reference === appointment.reference ? draft : { date: null, time: null };
  const date = stored.date ?? firstDateWithSlots(doctor, appointment) ?? today;
  const stripStart = date > toISODate(addDays(now(), 6)) ? date : today;
  const chips = dateStrip(doctor, stripStart);
  const eligibility = dateEligibility(appointment, date);
  const day = dayAvailability(doctor, date);
  // Figma lists only the free slots (and only the groups that have any); the appointment's own
  // slot isn't a new one.
  const groups = day.groups
    .map((group) => ({
      ...group,
      slots: group.slots.filter(
        (slot) => slot.available && !(date === appointment.date && slot.time === appointment.time),
      ),
    }))
    .filter((group) => group.slots.length > 0);
  const time =
    eligibility.ok && stored.time && groups.some((g) => g.slots.some((s) => s.time === stored.time && s.available))
      ? stored.time
      : null;

  const choose = (patch: { date?: string; time?: string | null }) =>
    rescheduleStore.write({
      reference: appointment.reference,
      date: patch.date ?? date,
      time: patch.time === undefined ? stored.time : patch.time,
    });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!time) return;
    router.push("/manage-appointment/reschedule/review");
  };

  const modeText = consultationModeLabel(appointment.mode);

  return (
    <>
      <ManagePage
        step={3}
        title={TITLE}
        description="Choose a new date and time. Your current appointment stays unchanged until you confirm."
        crumb="Reschedule Appointment"
        label="Reschedule appointment"
        actionBar
        onSubmit={onSubmit}
      >
        <section aria-labelledby={`${ids}-current`} className="flex flex-col gap-2">
          <h2 id={`${ids}-current`} className="font-heading text-h6 font-semibold text-pneutral-900">
            Current Appointment
          </h2>
          <Rows>
            <Row label="Doctor Name" value={doctor.name} />
            <Row label="Hospital Name" value={hospitalName(appointment.hospital)} />
            <Row label="Consultation Type" value={consultationTypeLabel(appointment.consultationType)} />
            <Row label="Consultation Mode" value={modeText} />
            <Row label="Current Appointment Date" value={formatDate(appointment.date)} />
            <Row label="Current Appointment Time" value={formatTime(appointment.time)} last />
          </Rows>
        </section>

        <section aria-labelledby={`${ids}-new`} className="flex flex-col gap-4">
          <h2 id={`${ids}-new`} className="font-heading text-h6 font-semibold text-pneutral-900">
            Select New Appointment Slot
          </h2>
          <div className="flex flex-col gap-3">
            <FieldHeading
              as="h3"
              id={`${ids}-date`}
              title="New Appointment Date"
              help={stripMonths(chips[0].date, chips[chips.length - 1].date)}
              helpId={`${ids}-date-help`}
              action={
                <Button
                  variant="text"
                  size="sm"
                  shape="rounded"
                  icon="calendar-outline-sm"
                  aria-haspopup="dialog"
                  onClick={() => setCalendarOpen(true)}
                  className="w-[110px] lg:w-[145px]"
                >
                  <span className="lg:hidden">Calendar</span>
                  <span className="hidden lg:inline">View calendar</span>
                </Button>
              }
            />
            <DateStrip
              chips={chips}
              value={date}
              onChange={(iso) => choose({ date: iso, time: null })}
              labelledBy={`${ids}-date`}
              describedBy={`${ids}-date-help`}
            />
          </div>
          {!eligibility.ok && (
            <p role="alert" className="rounded-sm bg-warning-50 px-4 py-4 font-heading text-typo-md text-warning-600">
              {eligibility.message}
            </p>
          )}
          {eligibility.ok && (
            <div className="flex flex-col gap-3">
              <FieldHeading
                as="h3"
                id={`${ids}-time`}
                title="Available Time Slots"
                help={`${formatWeekdayDate(date)} · ${modeText}`}
                helpId={`${ids}-time-help`}
              />
              <TimeSlotPicker
                groups={groups}
                value={time}
                onChange={(value) => choose({ time: value })}
                labelledBy={`${ids}-time`}
                describedBy={`${ids}-time-help`}
              />
            </div>
          )}
        </section>

        <FormActions
          bar="roomy"
          onBack={() => router.push("/manage-appointment/details")}
          continueDisabled={!time}
        />
      </ManagePage>

      {calendarOpen && (
        <CalendarDialog
          doctor={doctor}
          value={date}
          onClose={() => setCalendarOpen(false)}
          onDone={(picked) => {
            setCalendarOpen(false);
            if (picked !== date) choose({ date: picked, time: null });
          }}
        />
      )}
    </>
  );
}

/** First day from tomorrow on that has free slots (the default selection). */
function firstDateWithSlots(doctor: Doctor, appointment: Appointment) {
  for (let offset = 1; offset <= 30; offset += 1) {
    const iso = toISODate(addDays(now(), offset));
    if (dayAvailability(doctor, iso).available > 0 && dateEligibility(appointment, iso).ok) return iso;
  }
  return null;
}
