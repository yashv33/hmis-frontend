"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  BOOKING_ROUTES,
  RELATIONSHIPS,
  nextStep,
  previousStep,
  updateBooking,
  type BookingDraft,
  type BookingFor,
} from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import type { Doctor } from "@/lib/find-doctor/types";
import { AppointmentSummaryCard, AppointmentSummaryMobile } from "./appointment-summary";
import { BookingHeader } from "./booking-header";
import { BookingLayout, BookingSkeleton, bookingCard } from "./booking-layout";
import { BookingNote, FieldError, FieldHeading, FormActions } from "./form-parts";

const TITLE = "Who is this appointment for?";

type Errors = { bookingFor?: string; relationship?: string; otherRelationship?: string };

/**
 * Step 3 of 4 (Patient details) — Figma G-01.03 "Who Is This Appointment For" (desktop 117:9317,
 * mobile 117:9789, Someone Else 184:81487 / 184:81494). Booking for Myself or Someone Else; for
 * someone else the relationship is required, and "Other" asks for it in words.
 */
export function BookingForStep() {
  const guard = useStepGuard("bookingFor");
  if (!guard) return <BookingSkeleton step={3} title={TITLE} />;
  return <BookingForForm doctor={guard.doctor} draft={guard.draft} />;
}

function BookingForForm({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const ids = useId();
  const [errors, setErrors] = useState<Errors>({});

  const edit = () => router.push(BOOKING_ROUTES.details);
  const back = () => router.push(BOOKING_ROUTES[previousStep("bookingFor", draft) ?? "details"]);

  const choose = (value: BookingFor) => {
    setErrors({});
    updateBooking(
      value === "self"
        ? { bookingFor: value, relationship: "", otherRelationship: "", patient: null }
        : { bookingFor: value, patient: null },
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!draft.bookingFor) next.bookingFor = "Choose who the appointment is for.";
    if (draft.bookingFor === "someone-else") {
      if (!draft.relationship) next.relationship = "Select the relationship to the patient.";
      else if (draft.relationship === "Other" && !draft.otherRelationship.trim())
        next.otherRelationship = "Enter the relationship to the patient.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document
        .getElementById(
          next.bookingFor ? `${ids}-self` : next.relationship ? `${ids}-relationship` : `${ids}-other`,
        )
        ?.focus();
      return;
    }
    router.push(BOOKING_ROUTES[nextStep("bookingFor", draft)]);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: "Who Is This Appointment For" },
        ]}
      />
      <BookingHeader
        step={3}
        title={TITLE}
        description="Tell us who will see the doctor. You'll add the patient's details on the next step."
      >
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
        <form noValidate onSubmit={onSubmit} aria-labelledby={`${ids}-heading`} className={bookingCard({ gap: 6, mobileBottom: 8 })}>
          <FieldHeading
            id={`${ids}-heading`}
            title="Booking for"
            helpId={`${ids}-help`}
            help={
              <>
                Choose one option.<span className="lg:hidden"> You&apos;ll add the patient&apos;s details next.</span>
              </>
            }
          />

          <div className="flex flex-col gap-4">
            <div
              role="radiogroup"
              aria-labelledby={`${ids}-heading`}
              aria-describedby={errors.bookingFor ? `${ids}-help ${ids}-error` : `${ids}-help`}
              aria-required="true"
              className="flex flex-col gap-3"
            >
              <ChoiceCard
                id={`${ids}-self`}
                name="booking-for"
                value="self"
                checked={draft.bookingFor === "self"}
                onChange={() => choose("self")}
                title="Myself"
                description="I am the patient"
              />
              <ChoiceCard
                name="booking-for"
                value="someone-else"
                checked={draft.bookingFor === "someone-else"}
                onChange={() => choose("someone-else")}
                title="Someone Else"
                description="I'm booking for a family member or someone I care for"
              />
            </div>
            {errors.bookingFor && <FieldError id={`${ids}-error`}>{errors.bookingFor}</FieldError>}

            {draft.bookingFor === "someone-else" && (
              <>
                <Select
                  id={`${ids}-relationship`}
                  size="lg"
                  label="Relationship to Patient"
                  required
                  placeholder="Select relationship"
                  value={draft.relationship}
                  error={errors.relationship}
                  onChange={(value) => {
                    setErrors((current) => ({ ...current, relationship: undefined }));
                    updateBooking({ relationship: value, otherRelationship: "" });
                  }}
                  options={RELATIONSHIPS.map((value) => ({ value, label: value }))}
                />
                {draft.relationship === "Other" && (
                  <Input
                    id={`${ids}-other`}
                    label="Other Relationship"
                    required
                    placeholder="e.g. Family friend"
                    autoComplete="off"
                    value={draft.otherRelationship}
                    error={errors.otherRelationship}
                    onChange={(event) => {
                      setErrors((current) => ({ ...current, otherRelationship: undefined }));
                      updateBooking({ otherRelationship: event.target.value });
                    }}
                  />
                )}
              </>
            )}
          </div>

          <BookingNote icon="user-group-sm">
            The person you book for is the patient. Your contact details are kept separate from theirs.
          </BookingNote>

          <FormActions onBack={back} />
        </form>
      </BookingLayout>
    </>
  );
}
