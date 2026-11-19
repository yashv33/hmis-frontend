"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { FormActions } from "@/components/booking/form-parts";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { cancelAppointment } from "@/lib/appointments/api";
import { cancellationTerms } from "@/lib/appointments/rules";
import { rupees } from "@/lib/booking/charges";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { useRedirect } from "@/lib/hooks/use-redirect";
import { cancelStore, reasonLabel } from "@/lib/manage/drafts";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManagePage, Row, Rows } from "./manage-page";

const TITLE = "Review Appointment Cancellation";

/**
 * Manage step 4 of 4 — Figma G-03.05 "Review Appointment Cancellation" (desktop 170:64557, mobile
 * 170:64929; Not Paid 170:65051 / 170:65423) and G-03.06 "Cancelling Appointment" (170:65545 /
 * 170:65862). A paid appointment shows the cancellation and refund details, an unpaid one
 * ("Payment Due") its payment details with no refund; both end with the yellow "Are you sure…"
 * confirmation. Confirming shows the processing state, then the success page.
 */
export function CancelReviewStep() {
  const guard = useManageGuard();
  const router = useRouter();
  const draft = cancelStore.useStore();
  const [cancelling, setCancelling] = useState(false);

  const missing = Boolean(guard) && (draft.reference !== guard!.appointment.reference || !draft.reason);
  useRedirect(missing, "/manage-appointment/cancel");
  if (!guard || missing) return <BookingSkeleton step={4} title={TITLE} />;
  const { appointment: a, doctor } = guard;
  const terms = cancellationTerms(a);

  if (cancelling) {
    return (
      <ManagePage as="div" step={4} title="Cancel Appointment" crumb="Cancel Appointment" label="Cancelling appointment">
        <div role="status" className="flex flex-col items-center gap-4 rounded-sm bg-danger-50 p-6 text-center">
          <Icon name="loading-ring" className="animate-spin motion-reduce:animate-none" />
          <h2 className="font-heading text-h6 font-semibold text-pneutral-900">Cancelling Appointment…</h2>
          <p className="font-paragraph text-typo-md text-pneutral-900">Please wait while we process your request.</p>
        </div>
      </ManagePage>
    );
  }

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    setCancelling(true);
    await cancelAppointment(a, reasonLabel(draft));
    router.replace("/manage-appointment/cancel/success");
  };

  return (
    <ManagePage
      step={4}
      title={TITLE}
      crumb="Review Appointment Cancellation"
      label="Review appointment cancellation"
      actionBar="stacked"
      onSubmit={confirm}
    >
      <Rows>
        <Row label="Appointment Reference" value={a.reference} />
        <Row label="Patient Name" value={a.patient.name} />
        <Row label="Doctor Name" value={doctor.name} />
        <Row label="Hospital Name" value={hospitalName(a.hospital)} />
        <Row label="Appointment Date" value={formatDate(a.date)} />
        <Row label="Appointment Time" value={formatTime(a.time)} />
        <Row label="Cancellation Reason" value={reasonLabel(draft)} last />
      </Rows>

      {terms.notPaid ? (
        <section aria-labelledby="refund-details" className="flex flex-col gap-2">
          <h2 id="refund-details" className="font-heading text-h6 font-semibold text-pneutral-900">
            Payment Details
          </h2>
          <Rows>
            <Row label="Payment Status" value={<StatusBadge tone="warning">Payment Due</StatusBadge>} />
            <Row label="Amount Paid" value={rupees(0)} />
            <Row label="Outstanding Balance" value={rupees(0)} />
            <Row label="Refund Amount" value="Not applicable" last />
          </Rows>
        </section>
      ) : (
        <section aria-labelledby="refund-details" className="flex flex-col gap-2">
          <h2 id="refund-details" className="font-heading text-h6 font-semibold text-pneutral-900">
            Cancellation and Refund Details
          </h2>
          <Rows>
            <Row label="Amount Paid" value={rupees(terms.paid)} />
            <Row label="Cancellation Fee" value={rupees(terms.fee)} />
            <Row label="Refund Amount" value={rupees(terms.refund)} />
            <Row label="Refund Method" value="Original Payment Method" />
            <Row label="Estimated Refund Time" value="As per applicable policy" last />
          </Rows>
        </section>
      )}

      <p className="rounded-sm bg-danger-50 p-4 font-heading text-h6 font-semibold text-pneutral-900">
        Are you sure you want to cancel this appointment?
      </p>

      <FormActions
        onBack={() => router.push("/manage-appointment/details")}
        backLabel="Keep Appointment"
        continueLabel="Confirm Cancellation"
        bar="roomy"
        // Figma's row (178px + 153px at 375) cuts "Confirm Cancellation" off; under 640px they stack.
        stackOnNarrow
      />
    </ManagePage>
  );
}
