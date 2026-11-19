"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { FormActions } from "@/components/booking/form-parts";
import { amountPaid, reschedulingFee } from "@/lib/appointments/rules";
import { rescheduleAppointment } from "@/lib/appointments/api";
import { rupees } from "@/lib/booking/charges";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { consultationTypeLabel } from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { rescheduleStore } from "@/lib/manage/drafts";
import { useRedirect } from "@/lib/hooks/use-redirect";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { Row, Rows, ManagePage } from "./manage-page";
import { RescheduleFailed } from "./reschedule-failed";

const TITLE = "Review Rescheduling Details";

/** A table cell: 12px outer padding and an 8px gutter on mobile (Figma 96 / 102.5 / 102.5 text columns). */
const CELL = "px-1 py-3 first:pl-3 last:pr-3 lg:px-4 lg:first:pl-4 lg:last:pr-4";

/** The table's short consultation type: "Follow-up", "Referral", "New". */
const typeLabel = (type: Parameters<typeof consultationTypeLabel>[0]) =>
  consultationTypeLabel(type).replace(" Consultation", "");

/**
 * Manage step 4 of 4 — Figma G-02.05 "Review Rescheduling Details" (desktop 170:60818, mobile
 * 170:61188): the existing and proposed appointment side by side and the payment details. With
 * nothing to pay, "Confirm Rescheduling" moves the appointment; with an additional amount it goes on
 * to the payment step.
 */
export function RescheduleReviewStep() {
  const guard = useManageGuard();
  const router = useRouter();
  const draft = rescheduleStore.useStore();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const missing = Boolean(guard) && (draft.reference !== guard!.appointment.reference || !draft.date || !draft.time);
  useRedirect(missing, "/manage-appointment/reschedule");
  if (!guard || missing) return <BookingSkeleton step={4} title={TITLE} />;
  const { appointment: a, doctor } = guard;
  const date = draft.date!;
  const time = draft.time!;
  if (failed) return <RescheduleFailed appointment={a} refund={0} />;

  const fee = reschedulingFee(a);
  const paid = amountPaid(a);

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (fee > 0) return router.push("/manage-appointment/reschedule/payment");
    setBusy(true);
    const ok = await rescheduleAppointment(a, date, time);
    setBusy(false);
    if (ok) router.replace("/manage-appointment/reschedule/success");
    else setFailed(true);
  };

  const compare: [string, string, string][] = [
    ["Doctor Name", doctor.name, doctor.name],
    ["Hospital Name", hospitalName(a.hospital), hospitalName(a.hospital)],
    ["Consultation Type", typeLabel(a.consultationType), typeLabel(a.consultationType)],
    ["Appointment Date", formatDate(a.date), formatDate(date)],
    ["Appointment Time", formatTime(a.time), formatTime(time)],
  ];

  return (
    <ManagePage
      step={4}
      title={TITLE}
      description="Check the proposed appointment and any charges before you confirm."
      crumb="Review Rescheduling Details"
      label="Review rescheduling details"
      actionBar
      onSubmit={confirm}
    >
      <div className="overflow-hidden rounded-sm border border-pneutral-200">
        <table className="w-full table-fixed border-collapse text-left font-heading text-typo-md font-medium">
          <colgroup>
            <col className="w-[32.8%] lg:w-[32%]" />
            <col className="w-[32.4%] lg:w-[34%]" />
            <col className="w-[34.8%] lg:w-[34%]" />
          </colgroup>
          <thead>
            <tr className="bg-secondary-50 text-typo-sm font-semibold text-pneutral-900">
              <th scope="col" className={cn(CELL, "font-semibold")}>Data Field</th>
              <th scope="col" className={cn(CELL, "font-semibold")}>Existing Appointment</th>
              <th scope="col" className={cn(CELL, "font-semibold")}>Proposed Appointment</th>
            </tr>
          </thead>
          <tbody>
            {compare.map(([field, from, to]) => (
              <tr key={field} className="border-t border-pneutral-200 text-pneutral-900">
                <th scope="row" className={cn(CELL, "font-medium text-pneutral-700")}>{field}</th>
                <td className={CELL}>{from}</td>
                <td className={CELL}>{to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="payment-details" className="flex flex-col gap-2">
        <h2 id="payment-details" className="font-heading text-h6 font-semibold text-pneutral-900">
          Payment Details
        </h2>
        <Rows>
          <Row label="Original Amount Paid" value={rupees(paid)} />
          <Row label="Rescheduling Fee" value={rupees(fee)} />
          <Row label="Additional Amount Payable" value={rupees(fee)} />
          <Row label="Refund Amount" value={rupees(0)} last />
        </Rows>
      </section>

      <FormActions
        bar="roomy"
        onBack={() => router.push("/manage-appointment/reschedule")}
        continueLabel="Confirm Rescheduling"
        loading={busy}
      />
    </ManagePage>
  );
}
