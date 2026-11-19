"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Icon } from "@/components/ui/icon";
import { PAYMENT_METHODS, submitBooking, type BookingOutcome, type PaymentMethod, type Simulation } from "@/lib/booking/api";
import { chargesFor, paymentRequirement } from "@/lib/booking/charges";
import { BOOKING_ROUTES, updateBooking, type BookingDraft } from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";
import { AppointmentSummaryCard, AppointmentSummaryMobile } from "./appointment-summary";
import { BookingHeader } from "./booking-header";
import { BookingLayout, BookingSkeleton, bookingCard } from "./booking-layout";
import { FieldHeading } from "./form-parts";

const TITLE = "Confirm and Pay";

type Phase = "form" | "submitting" | "pending" | "failed";

/**
 * Step 4 of 4 (Review and pay) — Figma G-01.07 "Confirm and Pay" (desktop 162:48104, mobile
 * 162:48105). Panels: Online Payment, Pay at Hospital, Booking Failed and Booking Pending
 * (159:47301). Existing patients pay online; new patients confirm now and pay at the hospital.
 * Use `?simulate=failed` or `?simulate=pending` to see those two states.
 */
export function PaymentStep() {
  return (
    <Suspense fallback={<BookingSkeleton step={4} title={TITLE} />}>
      <PaymentGuard />
    </Suspense>
  );
}

function PaymentGuard() {
  const guard = useStepGuard("payment");
  const simulate = (useSearchParams().get("simulate") as Simulation) ?? null;
  if (!guard) return <BookingSkeleton step={4} title={TITLE} />;
  return <PaymentForm doctor={guard.doctor} draft={guard.draft} simulate={simulate === "failed" || simulate === "pending" ? simulate : null} />;
}

function PaymentForm({ doctor, draft, simulate }: { doctor: Doctor; draft: BookingDraft; simulate: Simulation }) {
  const router = useRouter();
  const ids = useId();
  const [phase, setPhase] = useState<Phase>("form");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [status, setStatus] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const requirement = paymentRequirement(draft);
  const charges = chargesFor(doctor);
  const hospital = hospitalName(draft.hospital ?? doctor.hospital);

  // Move focus to the result when the panel changes, so it is announced and reachable.
  useEffect(() => {
    if (phase === "failed" || phase === "pending") panelRef.current?.focus();
  }, [phase]);

  const finish = (outcome: BookingOutcome) => {
    if (outcome.status === "confirmed") {
      updateBooking({ confirmation: outcome.confirmation });
      router.replace(BOOKING_ROUTES.confirmation);
    } else if (outcome.status === "failed") {
      setPhase("failed");
      setStatus("We couldn't book this appointment.");
    } else {
      setPhase("pending");
      setStatus("We're confirming your booking. Please stay on this page.");
      void outcome.settle().then(finish);
    }
  };

  const submit = async () => {
    setPhase("submitting");
    setStatus("Processing your booking…");
    const outcome =
      requirement === "pay-now"
        ? await submitBooking(draft, doctor, { payment: "online", method, simulate })
        : await submitBooking(draft, doctor, { payment: "hospital", simulate });
    finish(outcome);
  };

  const submitting = phase === "submitting";
  const totalBox = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-pneutral-50 p-4">
      <p className="min-w-[160px] flex-1 font-heading text-typo-md font-medium text-pneutral-700">Total Amount Payable</p>
      <p className="whitespace-nowrap font-heading text-h6 font-semibold text-pneutral-900">{charges.totalLabel}</p>
    </div>
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: TITLE },
        ]}
      />
      <BookingHeader step={4} title={TITLE} description="Complete the last step to confirm your appointment.">
        <AppointmentSummaryMobile doctor={doctor} draft={draft} onEdit={() => router.push(BOOKING_ROUTES.details)} />
      </BookingHeader>

      <BookingLayout
        actionBar={false}
        rail={
          <>
            <AppointmentSummaryCard doctor={doctor} draft={draft} onEdit={() => router.push(BOOKING_ROUTES.details)} />
            <BookingHelpCard />
          </>
        }
      >
        <div className={bookingCard({ gap: 6, mobileBottom: 8 })}>
          <p role="status" aria-live="polite" className="sr-only">
            {status}
          </p>

          {phase === "failed" && (
            <div ref={panelRef} tabIndex={-1} role="alert" className="flex flex-col gap-6 outline-none">
              <div className="flex flex-col gap-3 rounded-sm bg-warning-50 p-6">
                <h2 className="flex items-center gap-2 font-heading text-h6 font-semibold text-pneutral-900">
                  <Icon name="alert-md" />
                  We couldn&apos;t book this appointment
                </h2>
                <p className="font-paragraph text-typo-md text-pneutral-900">
                  The time slot may no longer be available. If any amount was charged, it will be refunded to the
                  original payment method within 5–7 working days.
                </p>
              </div>
              <Button href="/" size="lg" shape="pill" fullWidth>
                Go to Home
              </Button>
              <p className="font-heading text-typo-sm text-pneutral-700">Need help? Call +91 98123 12489</p>
            </div>
          )}

          {phase === "pending" && (
            <div
              ref={panelRef}
              tabIndex={-1}
              role="status"
              className="flex flex-col items-center gap-4 rounded-sm bg-danger-50 p-6 text-center outline-none"
            >
              <Icon name="loading-ring" className="animate-spin motion-reduce:animate-none" />
              <h2 className="font-heading text-h6 font-semibold text-pneutral-900">We&apos;re confirming your booking</h2>
              <p className="font-paragraph text-typo-md text-pneutral-900">
                This can take a minute. Please stay on this page. Don&apos;t refresh or pay again.
              </p>
            </div>
          )}

          {(phase === "form" || phase === "submitting") &&
            (requirement === "pay-now" ? (
              <>
                <FieldHeading id={`${ids}-heading`} title="Online payment required" help="Pay now to confirm your appointment." />
                {totalBox}
                <div className="flex flex-col gap-3">
                  <p id={`${ids}-method`} className="font-heading text-typo-md font-medium text-pneutral-900">
                    Payment Method
                  </p>
                  <div role="radiogroup" aria-labelledby={`${ids}-method`} className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        name="payment-method"
                        value={option.value}
                        checked={method === option.value}
                        onChange={(value) => setMethod(value as PaymentMethod)}
                        title={option.title}
                        description={option.description}
                      />
                    ))}
                  </div>
                </div>
                <Button size="lg" shape="pill" fullWidth loading={submitting} onClick={submit}>
                  Proceed to Payment
                </Button>
                <p className="flex items-center gap-2 font-heading text-typo-sm text-pneutral-700">
                  <Icon name="shield-check-sm" />
                  <span className="min-w-0 flex-1">
                    Payments are processed securely. Your appointment is confirmed only after payment succeeds.
                  </span>
                </p>
              </>
            ) : (
              <>
                <FieldHeading id={`${ids}-heading`} title="Pay at the hospital" />
                {totalBox}
                <p className="flex items-start gap-3 rounded-sm bg-secondary-50 p-4 font-paragraph text-typo-md text-pneutral-900">
                  <Icon name="building-office-note" />
                  <span className="min-w-0 flex-1">
                    Pay at the {hospital} reception before your consultation. Please arrive 15 minutes early and quote
                    your appointment reference.
                  </span>
                </p>
                <Button size="lg" shape="pill" fullWidth loading={submitting} onClick={submit}>
                  Confirm Appointment
                </Button>
              </>
            ))}
        </div>
      </BookingLayout>
    </>
  );
}
