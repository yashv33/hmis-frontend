"use client";

import { useRouter } from "next/navigation";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { Button } from "@/components/ui/button";
import { maskMobile } from "@/lib/appointments/rules";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { consultationTypeLabel } from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { useRedirect } from "@/lib/hooks/use-redirect";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManageSuccessPage, Row, Rows, appointmentStatusBadge, paymentStatusBadge } from "./manage-page";

const TITLE = "Appointment Rescheduled Successfully";

/**
 * Figma G-02.07 "Appointment Rescheduled Successfully" (desktop 170:62156, mobile 170:62530): the
 * confirmation of the move — previous and new slot, status, payment — with View Appointment and
 * Return Home. Only reachable once an appointment has actually been moved.
 */
export function RescheduleSuccessStep() {
  const guard = useManageGuard();
  const router = useRouter();
  const missing = Boolean(guard) && !guard!.appointment.previous;
  useRedirect(missing, "/manage-appointment/details");
  if (!guard || missing) return <BookingSkeleton step={4} title={TITLE} />;
  const { appointment: a, doctor } = guard;
  const previous = a.previous!;
  return (
    <ManageSuccessPage
      title={TITLE}
      description={`We've sent the updated appointment details to ${maskMobile(a.mobile)}.`}
      crumb="Appointment Rescheduled Successfully"
    >
      <Rows>
        <Row label="Appointment Reference" value={a.reference} />
        <Row label="Patient Name" value={a.patient.name} />
        <Row label="Doctor Name" value={doctor.name} />
        <Row label="Hospital Name" value={hospitalName(a.hospital)} />
        <Row label="Consultation Type" value={consultationTypeLabel(a.consultationType)} />
        <Row label="Previous Appointment Date" value={formatDate(previous.date)} />
        <Row label="Previous Appointment Time" value={formatTime(previous.time)} />
        <Row label="New Appointment Date" value={formatDate(a.date)} />
        <Row label="New Appointment Time" value={formatTime(a.time)} />
        <Row label="Appointment Status" value={appointmentStatusBadge(a)} />
        <Row label="Payment Status" value={paymentStatusBadge(a)} last />
      </Rows>
      <div className="-mx-4 -mb-6 mt-2 flex h-[100px] items-center gap-3 border-t border-pneutral-200 px-4 lg:mx-0 lg:mb-0 lg:mt-0 lg:h-auto lg:flex-wrap lg:px-0 lg:pt-6">
        <Button shape="responsive" onClick={() => router.push("/manage-appointment/details")} className="w-[177px] lg:w-auto">
          View Appointment
        </Button>
        <Button variant="text" shape="responsive" onClick={() => router.push("/")} className="flex-1 lg:flex-none">
          Return Home
        </Button>
      </div>
    </ManageSuccessPage>
  );
}
