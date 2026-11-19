"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { FormActions } from "@/components/booking/form-parts";
import { Listbox } from "@/components/ui/listbox";
import { Textarea } from "@/components/ui/textarea";
import { canCancel } from "@/lib/appointments/rules";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { CANCELLATION_REASONS, cancelStore } from "@/lib/manage/drafts";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManagePage, Row, Rows } from "./manage-page";
import { NotAvailable } from "./not-available";

const TITLE = "Cancel Appointment";

/**
 * Manage step 3 of 4 — Figma G-03.04 "Cancel Appointment" (desktop 170:63079, mobile 170:63443;
 * Reason List Open 170:63557, Other Reason 170:64055, No Reason Selected 177:72545). The
 * appointment's identifying rows, then "Why do you want to cancel this appointment?": a required
 * reason from the list, plus free text when it is "Other". Continue stays disabled until both are
 * filled.
 */
export function CancelStep() {
  const guard = useManageGuard();
  if (!guard) return <BookingSkeleton step={3} title={TITLE} />;
  if (!canCancel(guard.appointment)) {
    return <NotAvailable action="cancel" appointment={guard.appointment} doctor={guard.doctor} />;
  }
  return <CancelForm reference={guard.appointment.reference} date={guard.appointment.date} time={guard.appointment.time} doctorName={guard.doctor.name} />;
}

function CancelForm({ reference, date, time, doctorName }: { reference: string; date: string; time: string; doctorName: string }) {
  const router = useRouter();
  const ids = useId();
  const draft = cancelStore.useStore();
  const [touched, setTouched] = useState(false);
  const mine = draft.reference === reference ? draft : { reference, reason: "", other: "" };

  const otherMissing = mine.reason === "Other" && !mine.other.trim();
  const complete = Boolean(mine.reason) && !otherMissing;
  const set = (patch: Partial<typeof mine>) => cancelStore.write({ ...mine, reference, ...patch });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!complete) {
      setTouched(true);
      return;
    }
    router.push("/manage-appointment/cancel/review");
  };

  return (
    <ManagePage
      step={3}
      title={TITLE}
      crumb="Cancel Appointment"
      label="Cancel appointment"
      actionBar
      onSubmit={onSubmit}
    >
      <Rows>
        <Row label="Appointment Reference" value={reference} />
        <Row label="Doctor Name" value={doctorName} />
        <Row label="Appointment Date" value={formatDate(date)} />
        <Row label="Appointment Time" value={formatTime(time)} last />
      </Rows>

      <section aria-labelledby={`${ids}-why`} className="flex flex-col gap-4">
        <h2 id={`${ids}-why`} className="font-heading text-h6 font-semibold text-pneutral-900">
          Why do you want to cancel this appointment?
        </h2>
        <Listbox
          id={`${ids}-reason`}
          label="Cancellation Reason"
          required
          placeholder="Select a reason"
          value={mine.reason}
          options={CANCELLATION_REASONS}
          error={touched && !mine.reason ? "Select a reason for cancelling." : undefined}
          onChange={(reason) => set({ reason, other: reason === "Other" ? mine.other : "" })}
        />
        {mine.reason === "Other" && (
          <Textarea
            id={`${ids}-other`}
            label="Other Reason"
            required
            placeholder="Tell us why you're cancelling"
            value={mine.other}
            error={touched && otherMissing ? "Tell us why you're cancelling." : undefined}
            onChange={(event) => set({ other: event.target.value })}
          />
        )}
      </section>

      <FormActions onBack={() => router.push("/manage-appointment/details")} continueDisabled={!complete} bar="roomy" />
    </ManagePage>
  );
}
