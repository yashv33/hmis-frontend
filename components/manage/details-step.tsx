"use client";

import { useRouter } from "next/navigation";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/booking/charges";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { consultationModeLabel, consultationTypeLabel } from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { Row, Rows, ManagePage, appointmentStatusBadge, paymentStatusBadge } from "./manage-page";

const TITLE = "Appointment Details";

/**
 * Manage step 3 of 4 — Figma G-02.03 "Appointment Details" (desktop 170:58732, mobile 170:59112;
 * New Booking Paid 184:74849, Payment Due 184:75219, Rescheduled 184:75589) and G-03.08 "Appointment
 * Details – Cancelled" (184:75959). One screen for every state: the rows show the current slot (a
 * rescheduled appointment simply shows its new one), the payment badge reads Paid or Payment Due,
 * and a cancelled appointment explains the refund above the rows and only offers Back.
 *
 * Mobile: the actions close the page in Figma's "Bottom Action Bar" — the three stacked buttons
 * (193px), or the cancelled page's full-width 56px Back (81px) — behind a full-bleed rule.
 */
export function AppointmentDetailsStep() {
  const guard = useManageGuard();
  const router = useRouter();
  if (!guard) return <BookingSkeleton step={3} title={TITLE} />;
  const { appointment: a, doctor } = guard;
  const cancelled = a.status === "cancelled";

  return (
    <ManagePage
      as="div"
      step={3}
      title={TITLE}
      description="Review your appointment. Available actions depend on its eligibility."
      crumb="Appointment Details"
      label="Appointment details"
    >
      {cancelled && a.cancellation && (
        <p className="rounded-sm bg-secondary-50 p-4 font-paragraph text-typo-md text-pneutral-900">
          This appointment was cancelled on {formatDate(a.cancellation.cancelledAt)}.
          {a.cancellation.refund > 0 &&
            ` A refund of ${rupees(a.cancellation.refund)} has been initiated to your original payment method.`}
        </p>
      )}
      <Rows>
        <Row label="Appointment Reference" value={a.reference} />
        <Row label="Patient Name" value={a.patient.name} />
        {a.patient.uhid ? (
          <Row label="UHID" value={a.patient.uhid} />
        ) : (
          <Row label="Provisional Registration ID" value={a.patient.registrationId ?? ""} />
        )}
        <Row label="Doctor Name" value={doctor.name} />
        <Row label="Hospital Name" value={hospitalName(a.hospital)} />
        <Row label="Consultation Type" value={consultationTypeLabel(a.consultationType)} />
        <Row label="Consultation Mode" value={consultationModeLabel(a.mode)} />
        <Row label="Appointment Date" value={formatDate(a.date)} />
        <Row label="Appointment Time" value={formatTime(a.time)} />
        <Row label="Appointment Status" value={appointmentStatusBadge(a)} />
        <Row label="Payment Status" value={paymentStatusBadge(a)} last />
      </Rows>
      <div className="-mx-4 -mb-3 mt-2 flex flex-col items-stretch gap-3 border-t border-pneutral-200 px-4 pt-3 lg:mx-0 lg:mb-0 lg:mt-0 lg:flex-row lg:flex-wrap lg:items-center lg:px-0 lg:pt-6">
        {cancelled ? (
          <Button variant="outlined" size="lg" shape="responsive" onClick={() => router.push("/manage-appointment")} className="lg:w-[108px]">
            Back
          </Button>
        ) : (
          <>
            <Button shape="responsive" onClick={() => router.push("/manage-appointment/reschedule")} className="lg:w-auto">
              Reschedule Appointment
            </Button>
            <Button variant="outlined" shape="responsive" onClick={() => router.push("/manage-appointment/cancel")} className="lg:w-auto">
              Cancel Appointment
            </Button>
            <Button variant="text" tone="secondary" shape="responsive" onClick={() => router.push("/manage-appointment")} className="lg:w-auto">
              Back
            </Button>
          </>
        )}
      </div>
    </ManagePage>
  );
}
