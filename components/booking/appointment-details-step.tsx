"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Select } from "@/components/ui/select";
import { dateStrip, dayAvailability, isSlotAvailable } from "@/lib/booking/availability";
import {
  addDays,
  formatMonthYear,
  formatWeekdayDate,
  now,
  parseISODate,
  sameMonth,
  toISODate,
  todayISO,
} from "@/lib/booking/dates";
import {
  BOOKING_ROUTES,
  CONSULTATION_MODES,
  CONSULTATION_TYPES,
  beginBooking,
  bookingDoctor,
  updateBooking,
  useBooking,
  type BookingDraft,
  type ConsultationMode,
  type ConsultationType,
} from "@/lib/booking/store";
import { getDoctor, hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor, Hospital } from "@/lib/find-doctor/types";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { BookingHeader } from "./booking-header";
import { BOOKING_CARD, BookingLayout, BookingSkeleton } from "./booking-layout";
import { CalendarDialog } from "./calendar-dialog";
import { DateStrip } from "./date-strip";
import { BookingNote, FieldError, FieldHeading, FormActions } from "./form-parts";
import { SelectedDoctorCard } from "./selected-doctor-card";
import { TimeSlotPicker } from "./time-slot-picker";

const TITLE = "Select Appointment Details";

/**
 * Step 2 of 4 — Figma G-01.02 "Select Appointment Details" (desktop 107:7256, mobile 110:8407,
 * calendar overlays 118:10270 / 118:10507). Opened from Find a Doctor with `?doctor=<id>`, which
 * starts a booking for that doctor; `?department=<specialty>` sends you to Find a Doctor filtered
 * by it. Without either, an unfinished booking resumes here.
 */
export function AppointmentDetailsStep() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const draft = useBooking();
  const requestedId = params.get("doctor");
  const department = params.get("department") ?? params.get("specialty");

  useEffect(() => {
    if (!hydrated) return;
    if (requestedId) {
      const doctor = getDoctor(requestedId);
      if (!doctor?.nextAvailable) router.replace("/find-doctor");
      else if (draft.doctorId !== doctor.id || draft.confirmation) beginBooking(doctor);
    } else if (department) {
      router.replace(`/find-doctor?specialty=${encodeURIComponent(department)}`);
    } else if (!bookingDoctor(draft) || draft.confirmation) {
      router.replace("/find-doctor");
    }
  }, [hydrated, requestedId, department, draft, router]);

  const doctor = bookingDoctor(draft);
  const ready =
    hydrated && doctor && !draft.confirmation && (!requestedId || draft.doctorId === requestedId);
  if (!ready) return <BookingSkeleton step={2} title={TITLE} />;
  return <AppointmentDetailsForm doctor={doctor} draft={draft} />;
}

/** "November 2026", or "November – December 2026" when the strip crosses a month. */
function stripMonths(first: string, last: string) {
  const a = parseISODate(first);
  const b = parseISODate(last);
  if (sameMonth(a, b)) return formatMonthYear(a);
  return a.getFullYear() === b.getFullYear()
    ? `${formatMonthYear(a).split(" ")[0]} – ${formatMonthYear(b)}`
    : `${formatMonthYear(a)} – ${formatMonthYear(b)}`;
}

function AppointmentDetailsForm({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const ids = useId();
  const slotsRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeMissing, setTimeMissing] = useState(false);

  const today = todayISO();
  const date = draft.date ?? today;
  const hospital: Hospital = draft.hospital ?? doctor.hospital;
  // The strip starts today; a day picked further out in the calendar starts it instead.
  const stripStart = date > toISODate(addDays(now(), 6)) ? date : today;
  const chips = dateStrip(doctor, stripStart);
  const day = dayAvailability(doctor, date);
  const time = draft.time && isSlotAvailable(doctor, date, draft.time) ? draft.time : null;

  const goToFindDoctor = () => router.push("/find-doctor");

  const selectDate = (iso: string) => {
    setTimeMissing(false);
    updateBooking({ date: iso, time: null });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!time) {
      setTimeMissing(true);
      slotsRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      return;
    }
    updateBooking({ hospital, date, time });
    router.push(BOOKING_ROUTES.bookingFor);
  };

  const hospitalId = `${ids}-hospital`;
  const modeLabel = draft.mode === "in-person" ? "In-person" : "Video consultation";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: TITLE },
        ]}
      />
      <BookingHeader
        step={2}
        title={TITLE}
        description={`Choose where, how and when you'd like to see ${doctor.name}.`}
      >
        <SelectedDoctorCard doctor={doctor} variant="header" onChangeDoctor={goToFindDoctor} />
      </BookingHeader>

      <BookingLayout
        rail={
          <>
            <SelectedDoctorCard doctor={doctor} variant="rail" onChangeDoctor={goToFindDoctor} />
            <BookingHelpCard />
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} aria-labelledby={`${ids}-title`} className={BOOKING_CARD}>
          <span id={`${ids}-title`} className="sr-only">
            Appointment details
          </span>

          <div className="flex flex-col gap-3">
            <FieldHeading
              id={`${hospitalId}-label`}
              title="Hospital Name"
              help={`Only hospitals where ${doctor.name} takes online bookings are listed.`}
              helpId={`${hospitalId}-help`}
            />
            <Select
              id={hospitalId}
              size="lg"
              labelledBy={`${hospitalId}-label`}
              describedBy={`${hospitalId}-help`}
              value={hospital}
              onChange={(value) => updateBooking({ hospital: value as Hospital })}
              options={[{ value: doctor.hospital, label: hospitalName(doctor.hospital) }]}
            />
          </div>

          <div className="flex flex-col gap-3">
            <FieldHeading id={`${ids}-type`} title="Consultation Type" />
            <div role="radiogroup" aria-labelledby={`${ids}-type`} className="flex flex-col gap-3 lg:flex-row lg:gap-4">
              {CONSULTATION_TYPES.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="consultation-type"
                  value={option.value}
                  checked={draft.consultationType === option.value}
                  onChange={(value) =>
                    updateBooking({ consultationType: value as ConsultationType, verification: null })
                  }
                  title={option.title}
                  description={option.description}
                  className="lg:min-w-0 lg:flex-1 lg:self-stretch"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <FieldHeading id={`${ids}-mode`} title="Consultation Mode" />
            <div role="radiogroup" aria-labelledby={`${ids}-mode`} className="flex flex-col gap-3 lg:flex-row lg:gap-4">
              {CONSULTATION_MODES.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="consultation-mode"
                  value={option.value}
                  checked={draft.mode === option.value}
                  onChange={(value) => updateBooking({ mode: value as ConsultationMode })}
                  title={option.title}
                  description={option.description}
                  className="lg:min-w-0 lg:flex-1 lg:self-stretch"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <FieldHeading
              id={`${ids}-date`}
              title="Appointment Date"
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
              onChange={selectDate}
              labelledBy={`${ids}-date`}
              describedBy={`${ids}-date-help`}
            />
          </div>

          <div ref={slotsRef} className="flex flex-col gap-3">
            <FieldHeading
              id={`${ids}-time`}
              title="Available Time Slots"
              helpId={`${ids}-time-help`}
              help={
                <>
                  {formatWeekdayDate(date)} · {modeLabel}
                  {draft.mode === "in-person" && (
                    <span className="hidden lg:inline"> at {hospitalName(hospital)}</span>
                  )}
                </>
              }
            />
            {timeMissing && <FieldError id={`${ids}-time-error`}>Choose a time to continue.</FieldError>}
            <TimeSlotPicker
              groups={day.groups}
              value={time}
              onChange={(value) => {
                setTimeMissing(false);
                updateBooking({ date, time: value });
              }}
              labelledBy={`${ids}-time`}
              describedBy={timeMissing ? `${ids}-time-help ${ids}-time-error` : `${ids}-time-help`}
              invalid={timeMissing}
            />
          </div>

          <BookingNote>
            Selecting a time doesn&apos;t book it. We&apos;ll check the slot is still free before you
            confirm.
          </BookingNote>

          <FormActions onBack={goToFindDoctor} />
        </form>
      </BookingLayout>

      {calendarOpen && (
        <CalendarDialog
          doctor={doctor}
          value={date}
          onClose={() => setCalendarOpen(false)}
          onDone={(picked) => {
            setCalendarOpen(false);
            if (picked !== date) selectDate(picked);
          }}
        />
      )}
    </>
  );
}
