"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  BOOKING_ROUTES,
  consultationTypeLabel,
  nextStep,
  previousStep,
  updateBooking,
  type BookingDraft,
} from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import {
  REFERENCE_FORMAT,
  normalizeVerifyReference,
  verifyReference,
  type VerifyKind,
  type VerifyResult,
} from "@/lib/booking/verification";
import type { Doctor } from "@/lib/find-doctor/types";
import { cn } from "@/lib/cn";
import { AppointmentSummaryCard, AppointmentSummaryMobile } from "./appointment-summary";
import { BookingHeader } from "./booking-header";
import { BookingLayout, BookingSkeleton, bookingCard } from "./booking-layout";
import { FieldHeading, FormActions } from "./form-parts";

const COPY: Record<
  VerifyKind,
  { title: string; description: string; heading: string; help: string; button: string; crumb: string }
> = {
  "follow-up": {
    title: "Verify Previous Consultation",
    description: "You chose a Follow-up Consultation. Verify the earlier appointment to continue.",
    heading: "Verify Previous Consultation",
    help: "Enter the reference of the earlier appointment with this doctor. We'll check that the follow-up is still valid.",
    button: "Verify Previous Appointment",
    crumb: "Verify Previous Consultation",
  },
  referral: {
    title: "Verify Referral",
    description: "You chose a Referral Consultation. Verify the referral to continue.",
    heading: "Verify Referral",
    help: "Enter the referral reference from your referring doctor. We'll check the referral is valid for this appointment.",
    button: "Verify Referral",
    crumb: "Verify Referral",
  },
};

/**
 * Step 3 of 4 (Patient details) for follow-up and referral consultations — Figma G-01.05A "Verify
 * Previous Consultation" (131:25141 / mobile 131:25616) and G-01.05B "Verify Referral" (131:25765 /
 * 131:26240); the result panels are 128:24026 and 128:24294. The step doesn't exist for a New
 * Consultation. Mock references are described in lib/booking/verification.ts.
 */
export function VerifyStep() {
  const guard = useStepGuard("verify");
  if (!guard) return <BookingSkeleton step={3} title="Verify Previous Consultation" />;
  return <VerifyForm doctor={guard.doctor} draft={guard.draft} />;
}

function VerifyForm({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const ids = useId();
  const kind: VerifyKind = draft.consultationType === "referral" ? "referral" : "follow-up";
  const copy = COPY[kind];
  const format = REFERENCE_FORMAT[kind];
  const statusRef = useRef<HTMLParagraphElement>(null);

  const [reference, setReference] = useState(draft.verification?.reference ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [restored, setRestored] = useState(Boolean(draft.verification));

  const verified = restored || result?.status === "eligible";
  const eligible = result?.status === "eligible" ? result : null;

  const edit = () => router.push(BOOKING_ROUTES.details);
  const back = () => router.push(BOOKING_ROUTES[previousStep("verify", draft) ?? "patient"]);

  const check = async () => {
    const value = normalizeVerifyReference(reference);
    if (!value) {
      setError(`Enter the ${format.label.toLowerCase()}.`);
      document.getElementById(`${ids}-reference`)?.focus();
      return;
    }
    setError("");
    setChecking(true);
    setResult(null);
    setRestored(false);
    updateBooking({ verification: null });
    const outcome = await verifyReference(kind, value, doctor, draft.date ?? "");
    setChecking(false);
    if (outcome.status === "invalid") {
      setError(outcome.message);
      document.getElementById(`${ids}-reference`)?.focus();
      return;
    }
    setResult(outcome);
    if (outcome.status === "eligible") {
      updateBooking({ verification: { reference: value, validUntil: outcome.validUntil } });
    }
    setStatus(
      outcome.status === "eligible"
        ? `${format.label} verified. You can continue.`
        : outcome.message ?? "",
    );
  };

  const changeToNew = () => {
    updateBooking({ consultationType: "new", verification: null });
    router.push(BOOKING_ROUTES.review);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!verified) {
      const message = `Verify the ${kind === "follow-up" ? "previous appointment" : "referral"} to continue.`;
      setError(message);
      setStatus(message);
      document.getElementById(`${ids}-reference`)?.focus();
      return;
    }
    router.push(BOOKING_ROUTES[nextStep("verify", draft)]);
  };

  const badgeTone = (s: VerifyResult["status"]) =>
    s === "eligible" ? "success" : s === "not-eligible" ? "danger" : "warning";
  const badgeLabel = (s: VerifyResult["status"]) =>
    s === "eligible" ? "Eligible" : s === "not-eligible" ? "Not Eligible" : "Verification Required";

  const summary =
    result && result.status !== "invalid" ? (
      <div className="flex flex-col gap-1 rounded-sm bg-pneutral-50 p-4">
        <dl>
          {result.rows.map(([label, value]) => (
            <SummaryRow key={label} label={label} value={value} />
          ))}
          {result.validityRow && result.validityPosition === "before" && (
            <SummaryRow label={result.validityRow[0]} value={result.validityRow[1]} />
          )}
          <SummaryRow
            label={result.eligibilityLabel}
            value={<StatusBadge tone={badgeTone(result.status)}>{badgeLabel(result.status)}</StatusBadge>}
          />
          {result.validityRow && result.validityPosition === "after" && (
            <SummaryRow label={result.validityRow[0]} value={result.validityRow[1]} />
          )}
        </dl>
      </div>
    ) : null;

  const blocked = result && (result.status === "not-eligible" || result.status === "verification-required") ? result : null;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: copy.crumb },
        ]}
      />
      <BookingHeader step={3} title={copy.title} description={copy.description}>
        <AppointmentSummaryMobile doctor={doctor} draft={draft} onEdit={edit} />
      </BookingHeader>

      <BookingLayout
        rail={
          <>
            <AppointmentSummaryCard doctor={doctor} draft={draft} onEdit={edit} />
            <BookingHelpCard />
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} aria-labelledby={`${ids}-heading`} className={bookingCard({ gap: 6, mobileBottom: 6 })}>
          <p ref={statusRef} role="status" aria-live="polite" className="sr-only">
            {status}
          </p>
          <div className="flex flex-col gap-4">
            <FieldHeading id={`${ids}-heading`} title={copy.heading} help={copy.help} />

            <div className="flex flex-wrap items-start gap-3">
              <Input
                id={`${ids}-reference`}
                label={format.label}
                required
                autoComplete="off"
                autoCapitalize="characters"
                value={reference}
                error={error || undefined}
                onChange={(event) => {
                  setReference(event.target.value);
                  setError("");
                  setResult(null);
                  setRestored(false);
                  updateBooking({ verification: null });
                }}
                className="min-w-[280px] flex-1"
              />
              <Button
                type="button"
                variant={result || restored ? "outlined" : "filled"}
                tone="secondary"
                size="lg"
                shape="rounded"
                loading={checking}
                onClick={check}
                // Bottom-aligned with the 52px field (Figma "Reference Row" is items-end): 20px down.
                className={cn("w-full lg:mt-5 lg:w-auto", kind === "follow-up" ? "lg:w-[291px]" : "lg:w-[150px]")}
              >
                {copy.button}
              </Button>
            </div>

            {restored && !result && (
              <p className="flex items-center gap-2 rounded-sm bg-success-50 p-4 font-heading text-typo-md font-medium text-pneutral-900">
                <StatusBadge tone="success">Eligible</StatusBadge>
                This {consultationTypeLabel(draft.consultationType).toLowerCase()} was verified.
              </p>
            )}
            {summary}
            {blocked && (
              <>
                <p
                  role="alert"
                  className={cn(
                    "rounded-xsm px-4 py-3 font-heading text-typo-sm",
                    blocked.status === "not-eligible" ? "bg-warning-50 text-warning-600" : "bg-danger-50 text-pneutral-900",
                  )}
                >
                  {blocked.message}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outlined" size="md" shape="rounded" onClick={changeToNew}>
                    Change to New Consultation
                  </Button>
                  <Button href="tel:+919812312489" variant="text" size="md" shape="rounded">
                    Call +91 98123 12489
                  </Button>
                </div>
              </>
            )}
          </div>

          <FormActions onBack={back} />
        </form>
      </BookingLayout>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2 font-heading text-typo-md font-medium">
      <dt className="w-[220px] shrink-0 text-pneutral-700">{label}</dt>
      <dd className="flex min-w-0 flex-1 justify-end text-right text-pneutral-900">{value}</dd>
    </div>
  );
}
