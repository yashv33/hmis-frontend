"use client";

import { useRouter } from "next/navigation";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { maskMobile } from "@/lib/appointments/rules";
import { rupees } from "@/lib/booking/charges";
import { formatDate, formatTime } from "@/lib/booking/dates";
import { consultationTypeLabel } from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { useRedirect } from "@/lib/hooks/use-redirect";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManageSuccessPage, Row, Rows, appointmentStatusBadge } from "./manage-page";

const TITLE = "Appointment Cancelled Successfully";

/**
 * Figma G-03.07 "Appointment Cancelled Successfully" (desktop 170:65923, mobile 170:66300): the
 * cancelled appointment with the reason, the date and the refund, plus View Appointment (the
 * cancelled details) and Return Home. Only reachable once an appointment has been cancelled.
 */
export function CancelSuccessStep() {
  const guard = useManageGuard();
  const router = useRouter();
  const missing = Boolean(guard) && guard!.appointment.status !== "cancelled";
  useRedirect(missing, "/manage-appointment/details");
  if (!guard || missing) return <BookingSkeleton step={4} title={TITLE} />;
  const { appointment: a, doctor } = guard;
  const cancellation = a.cancellation!;
  return (
    <ManageSuccessPage
      title={TITLE}
      description={`We've sent the cancellation details to ${maskMobile(a.mobile)}.`}
      crumb="Appointment Cancelled Successfully"
    >
      <Rows>
        <Row label="Appointment Reference" value={a.reference} />
        <Row label="Patient Name" value={a.patient.name} />
        <Row label="Doctor Name" value={doctor.name} />
        <Row label="Hospital Name" value={hospitalName(a.hospital)} />
        <Row label="Consultation Type" value={consultationTypeLabel(a.consultationType)} />
        <Row label="Appointment Date" value={formatDate(a.date)} />
        <Row label="Appointment Time" value={formatTime(a.time)} />
        <Row label="Appointment Status" value={appointmentStatusBadge(a)} />
        <Row label="Cancellation Date" value={formatDate(cancellation.cancelledAt)} />
        <Row label="Cancellation Reason" value={cancellation.reason} last={cancellation.refund === 0} />
        {cancellation.refund > 0 && <Row label="Refund Amount" value={rupees(cancellation.refund)} />}
        {cancellation.refund > 0 && (
          <Row label="Refund Status" value={<StatusBadge tone="warning">Initiated</StatusBadge>} last />
        )}
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
