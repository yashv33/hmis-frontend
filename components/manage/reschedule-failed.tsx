"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { rupees } from "@/lib/booking/charges";
import { formatDate, formatTime } from "@/lib/booking/dates";
import type { Appointment } from "@/lib/appointments/store";
import { ManagePage, PinnedAction, Row, Rows } from "./manage-page";

/**
 * "Rescheduling Not Completed" — Figma G-02.06 Rescheduling Payment · Rescheduling Failed (desktop
 * 172:70426, mobile 172:70775): the original appointment is unchanged. When money was taken the
 * refund is shown as initiated; without a payment the notice just says nothing changed.
 */
export function RescheduleFailed({ appointment, refund }: { appointment: Appointment; refund: number }) {
  const router = useRouter();
  return (
    <ManagePage as="div" step={4} title="Rescheduling Not Completed" crumb="Rescheduling Payment" label="Rescheduling not completed" actionBar="single">
      <p role="alert" className="rounded-sm bg-warning-50 px-4 py-4 font-heading text-typo-md text-warning-600">
        {refund > 0
          ? "Your payment was received, but we could not reschedule your appointment. Your original appointment is unchanged and the payment will be refunded."
          : "We could not reschedule your appointment because the new time is no longer available. Your original appointment is unchanged."}
      </p>
      <Rows>
        <Row label="Appointment Reference" value={appointment.reference} />
        <Row label="Appointment Date" value={formatDate(appointment.date)} />
        <Row label="Appointment Time" value={formatTime(appointment.time)} />
        <Row label="Appointment Status" value={<StatusBadge tone="success">Confirmed</StatusBadge>} last={refund === 0} />
        {refund > 0 && <Row label="Refund Amount" value={rupees(refund)} />}
        {refund > 0 && <Row label="Refund Status" value={<StatusBadge tone="warning">Initiated</StatusBadge>} last />}
      </Rows>
      <p className="font-paragraph text-typo-lg text-pneutral-900">Please contact the hospital for assistance.</p>
      <PinnedAction>
        <Button variant="outlined" size="lg" shape="responsive" onClick={() => router.push("/manage-appointment/details")} className="w-full lg:w-[108px]">
          Back
        </Button>
      </PinnedAction>
    </ManagePage>
  );
}
