"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { formatMobile } from "@/lib/booking/patient";
import {
  BOOKING_ROUTES,
  bookingForLabel,
  consultationModeLabel,
  consultationTypeLabel,
  nextStep,
  previousStep,
  updateBooking,
  type BookingDraft,
} from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";
import { BookingHeader } from "./booking-header";
import { BookingLayout, BookingSkeleton, bookingCard } from "./booking-layout";
import { ChargesCard } from "./charges-card";
import { ConsentCheckbox } from "./consent-checkbox";
import { FieldError, FormActions } from "./form-parts";
import { SummaryRow, SummarySection } from "./summary-parts";

const TITLE = "Appointment Booking Summary";

/**
 * Step 4 of 4 (Review and pay) — Figma G-01.06 "Appointment Booking Summary" (desktop 131:26389,
 * mobile 131:26895; Someone Else 184:76522 / 184:76966). Patient, appointment and contact details
 * with Edit links, the consultation charges, and the consent that "Confirm Appointment" needs.
 */
export function ReviewStep() {
  const guard = useStepGuard("review");
  if (!guard) return <BookingSkeleton step={4} title={TITLE} />;
  return <ReviewForm doctor={guard.doctor} draft={guard.draft} />;
}

function ReviewForm({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const ids = useId();
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const patient = draft.patient!;

  const back = () => router.push(BOOKING_ROUTES[previousStep("review", draft) ?? "patient"]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.consent) {
      setError("Confirm that the details are correct to continue.");
      document.getElementById(`${ids}-consent`)?.focus();
      return;
    }
    router.push(BOOKING_ROUTES[nextStep("review", draft)]);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: "Review and Pay" },
        ]}
      />
      <BookingHeader step={4} title={TITLE} description="Check the details and charges, then confirm your appointment." />

      <BookingLayout
        rail={
          <>
            <ChargesCard doctor={doctor} draft={draft} />
            <BookingHelpCard />
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} aria-label="Booking summary" className={bookingCard({ gap: 8, mobileBottom: 6 })}>
          <SummarySection
            title="Patient Details"
            editLabel="Edit patient details"
            onEdit={() => router.push(BOOKING_ROUTES.patient)}
          >
            <SummaryRow label="Patient Name" value={patient.name} />
            {patient.uhid ? (
              <SummaryRow label="UHID" value={patient.uhid} />
            ) : (
              <SummaryRow label="Temporary Registration ID" mobileLabel="Temporary ID" value="Generated on confirmation" />
            )}
            <SummaryRow
              label="Patient Registration Status"
              mobileLabel="Registration Status"
              value={patient.status === "existing" ? "Existing Patient" : "New Patient"}
            />
            <SummaryRow label="Booking For" value={bookingForLabel(draft)} last />
          </SummarySection>

          <SummarySection
            title="Appointment Details"
            editLabel="Edit appointment details"
            onEdit={() => router.push(BOOKING_ROUTES.details)}
          >
            <SummaryRow label="Doctor Name" value={doctor.name} />
            <SummaryRow label="Hospital Name" value={hospitalName(draft.hospital ?? doctor.hospital)} />
            <SummaryRow label="Consultation Type" value={consultationTypeLabel(draft.consultationType)} />
            <SummaryRow label="Consultation Mode" value={consultationModeLabel(draft.mode)} />
            <SummaryRow label="Appointment Date" value={draft.date ? formatDate(draft.date) : "—"} />
            <SummaryRow label="Appointment Time" value={draft.time ? formatTime(draft.time) : "—"} last />
          </SummarySection>

          <SummarySection title="Booking Contact">
            <SummaryRow
              label="Booking Contact Mobile"
              mobileLabel="Mobile"
              value={
                <>
                  {formatMobile(patient.mobile)}
                  <StatusBadge tone="success" dot={false}>
                    Verified
                  </StatusBadge>
                </>
              }
              last
            />
          </SummarySection>

          <ChargesCard doctor={doctor} draft={draft} className="lg:hidden" />

          <div className="flex flex-col gap-2">
            <ConsentCheckbox
              id={`${ids}-consent`}
              checked={draft.consent}
              invalid={Boolean(error)}
              describedBy={error ? `${ids}-consent-error` : undefined}
              onChange={(consent) => {
                setError("");
                updateBooking({ consent });
              }}
            >
              I confirm these details are correct and agree to TiaMeds&apos; appointment, rescheduling and
              cancellation terms.
            </ConsentCheckbox>
            {error && <FieldError id={`${ids}-consent-error`}>{error}</FieldError>}
          </div>

          <p ref={statusRef} className="sr-only" />
          <FormActions onBack={back} continueLabel="Confirm Appointment" />
        </form>
      </BookingLayout>
    </>
  );
}
