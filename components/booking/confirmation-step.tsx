"use client";

import { useRouter } from "next/navigation";
import { useId, type ReactNode } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { formatMobile } from "@/lib/booking/patient";
import {
  consultationModeLabel,
  consultationTypeLabel,
  type BookingDraft,
} from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import { startVerifiedSession } from "@/lib/manage/store";
import { HOSPITAL_ADDRESS, hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";
import { SuccessHeader } from "./success-header";
import { BookingLayout, BookingSkeleton } from "./booking-layout";

const TITLE = "Appointment Booked Successfully";

/**
 * Appointment confirmation — Figma G-01.08 "Appointment Booked Successfully" (desktop 162:48106,
 * mobile 162:48107; Paid 162:50585, Payment Due 162:51206). A booking is only ever confirmed here:
 * the guard sends anyone without a confirmed booking back to the first incomplete step.
 */
export function ConfirmationStep() {
  const guard = useStepGuard("confirmation");
  if (!guard || !guard.draft.confirmation) return <BookingSkeleton step={4} title={TITLE} />;
  return <Confirmation doctor={guard.doctor} draft={guard.draft} />;
}

function Row({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-t border-pneutral-200 py-3 font-heading text-typo-md font-medium",
        last && "border-b",
      )}
    >
      <dt className="w-[160px] shrink-0 text-pneutral-700 lg:w-[200px]">{label}</dt>
      <dd className="flex min-w-0 flex-1 justify-end text-right text-pneutral-900">{value}</dd>
    </div>
  );
}

/** Figma "Before Your Visit Card" (161:47997): three tips with 20px icons. */
function BeforeYourVisit({ time, className }: { time: string | null; className?: string }) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-3 rounded-lg border border-pneutral-200 bg-white p-6", className)}
    >
      <h2 id={headingId} className="font-heading text-h6 font-semibold text-pneutral-900">
        Before your visit
      </h2>
      <ul className="flex flex-col gap-3 font-paragraph text-typo-md text-pneutral-900">
        {(
          [
            ["clock-outline", `Arrive 15 minutes before ${time ? formatTime(time) : "your appointment"}.`],
            ["briefcase-outline-md", "Bring a photo ID and any previous reports."],
            ["arrow-path-outline", "To reschedule or cancel, use Manage Appointment."],
          ] as const
        ).map(([icon, text]) => (
          <li key={text} className="flex items-start gap-3">
            <Icon name={icon} />
            <span className="min-w-0 flex-1">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Confirmation({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const confirmation = draft.confirmation!;
  const patient = draft.patient!;
  const paid = confirmation.paymentStatus === "paid";
  const hospital = draft.hospital ?? doctor.hospital;

  // The confirmed draft stays in the session (the guard keeps this page the only reachable step);
  // the next "View Availability" starts a fresh booking over it.
  const leave = (href: string) => router.push(href);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: "Appointment Confirmation" },
        ]}
      />
      <SuccessHeader
        title={TITLE}
        description={`We've sent the appointment details to ${formatMobile(patient.mobile)}.`}
      />

      <BookingLayout
        actionBar={false}
        rail={
          <>
            <BeforeYourVisit time={draft.time} />
            <BookingHelpCard />
          </>
        }
      >
        <div className="flex flex-col gap-6 px-4 py-6 lg:rounded-lg lg:border lg:border-pneutral-200 lg:bg-white lg:p-8">
          <h2 className="font-heading text-h6 font-semibold text-pneutral-900">Appointment Confirmation</h2>
          <dl>
            <Row label="Appointment Reference" value={confirmation.reference} />
            <Row label="Appointment Status" value={<StatusBadge tone="success">Confirmed</StatusBadge>} />
            <Row label="Patient Name" value={patient.name} />
            {confirmation.registrationId ? (
              <Row label="Provisional Registration ID" value={confirmation.registrationId} />
            ) : (
              <Row label="UHID" value={patient.uhid ?? ""} />
            )}
            <Row label="Doctor Name" value={doctor.name} />
            <Row label="Hospital Name" value={hospitalName(hospital)} />
            <Row label="Consultation Type" value={consultationTypeLabel(draft.consultationType)} />
            <Row label="Consultation Mode" value={consultationModeLabel(draft.mode)} />
            <Row label="Appointment Date" value={draft.date ? formatDate(draft.date) : "—"} />
            <Row label="Appointment Time" value={draft.time ? formatTime(draft.time) : "—"} />
            <Row
              label="Payment Status"
              value={<StatusBadge tone={paid ? "success" : "warning"}>{paid ? "Paid" : "Payment Due"}</StatusBadge>}
            />
            <Row label="Hospital Location" value={HOSPITAL_ADDRESS[hospital]} last />
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              shape="pill"
              onClick={() => {
                // Booked just now with a verified mobile: the details open without another OTP.
                startVerifiedSession(confirmation.reference, patient.mobile);
                leave("/manage-appointment/details");
              }}
              className="w-[177px]"
            >
              View Appointment
            </Button>
            <Button variant="outlined" shape="pill" onClick={() => leave("/manage-appointment")} className="w-[199px]">
              Manage Appointment
            </Button>
            <Button variant="text" shape="pill" onClick={() => leave("/")} className="w-[136px]">
              Return Home
            </Button>
          </div>
          <BeforeYourVisit time={draft.time} className="lg:hidden" />
        </div>
      </BookingLayout>
    </>
  );
}
