"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useState } from "react";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { rescheduleAppointment } from "@/lib/appointments/api";
import { reschedulingFee } from "@/lib/appointments/rules";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/booking/api";
import { rupees } from "@/lib/booking/charges";
import { delay } from "@/lib/booking/patient";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { rescheduleStore } from "@/lib/manage/drafts";
import { useRedirect } from "@/lib/hooks/use-redirect";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManagePage, PinnedAction, Row, Rows } from "./manage-page";
import { RescheduleFailed } from "./reschedule-failed";

/**
 * Manage step 4 of 4 — Figma G-02.06 "Rescheduling Payment" (desktop 172:69929, mobile 172:70302):
 * the additional amount in the page title, the proposed move and a payment method. A payment that
 * can't be completed against a slot that has gone shows "Rescheduling Not Completed" with the refund
 * (use `?simulate=failed` to see it).
 */
export function ReschedulePaymentStep() {
  return (
    <Suspense fallback={<BookingSkeleton step={4} title="Rescheduling Payment" />}>
      <PaymentGuard />
    </Suspense>
  );
}

function PaymentGuard() {
  const guard = useManageGuard();
  const router = useRouter();
  const draft = rescheduleStore.useStore();
  const simulate = useSearchParams().get("simulate");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const ids = useId();

  const fee = guard ? reschedulingFee(guard.appointment) : 0;
  const missing = Boolean(guard) && (draft.reference !== guard!.appointment.reference || !draft.date || !draft.time || fee === 0);
  useRedirect(missing, "/manage-appointment/reschedule");
  if (!guard || missing) return <BookingSkeleton step={4} title="Rescheduling Payment" />;
  const { appointment: a, doctor } = guard;
  if (failed) return <RescheduleFailed appointment={a} refund={fee} />;
  const date = draft.date!;
  const time = draft.time!;

  const pay = async () => {
    setBusy(true);
    await delay(1200);
    const ok = simulate !== "failed" && (await rescheduleAppointment(a, date, time));
    setBusy(false);
    if (ok) router.replace("/manage-appointment/reschedule/success");
    else setFailed(true);
  };

  return (
    <ManagePage
      as="div"
      step={4}
      title={`Additional Amount Payable: ${rupees(fee)}`}
      crumb="Rescheduling Payment"
      label="Rescheduling payment"
      actionBar="single"
    >
      <section aria-labelledby={`${ids}-proposed`} className="flex flex-col gap-2">
        <h2 id={`${ids}-proposed`} className="font-heading text-h6 font-semibold text-pneutral-900">
          Proposed Appointment
        </h2>
        <Rows>
          <Row label="Doctor Name" value={doctor.name} />
          <Row label="Previous Appointment" value={`${formatDate(a.date)}, ${formatTime(a.time)}`} />
          <Row label="New Appointment" value={`${formatDate(date)}, ${formatTime(time)}`} last />
        </Rows>
      </section>
      <div className="flex flex-col gap-3">
        <p id={`${ids}-method`} className="font-heading text-typo-md font-medium text-pneutral-900">
          Payment Method
        </p>
        <div role="radiogroup" aria-labelledby={`${ids}-method`} className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((option) => (
            <ChoiceCard
              key={option.value}
              name="reschedule-payment-method"
              value={option.value}
              checked={method === option.value}
              onChange={(value) => setMethod(value as PaymentMethod)}
              title={option.title}
              description={option.description}
            />
          ))}
        </div>
      </div>
      <PinnedAction divider={false}>
        <Button size="lg" shape="pill" fullWidth loading={busy} onClick={pay}>
          Proceed to Payment
        </Button>
      </PinnedAction>
    </ManagePage>
  );
}
