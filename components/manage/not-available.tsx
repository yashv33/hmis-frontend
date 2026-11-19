"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/booking/dates";
import type { Appointment } from "@/lib/appointments/store";
import type { Doctor } from "@/lib/find-doctor/types";
import { ManagePage, PinnedAction, Row, Rows } from "./manage-page";

/**
 * "Rescheduling Not Available" (Figma G-02.03, desktop 170:59243) and "Cancellation Not Available"
 * (G-03.03, 170:62654): the period for the action has ended — a red notice, the helpline hint, the
 * four identifying rows and Back (pinned to the bottom of the screen on mobile, 170:59581 / 170:62992).
 */
export function NotAvailable({
  action,
  appointment,
  doctor,
}: {
  action: "reschedule" | "cancel";
  appointment: Appointment;
  doctor: Doctor;
}) {
  const router = useRouter();
  const title = action === "reschedule" ? "Rescheduling Not Available" : "Cancellation Not Available";
  const period = action === "reschedule" ? "rescheduling" : "cancellation";
  return (
    <ManagePage as="div" step={3} title={title} crumb={title} label={title} actionBar="single">
      <p role="alert" className="rounded-sm bg-warning-50 px-4 py-4 font-heading text-typo-md text-warning-600">
        This appointment cannot be {action === "reschedule" ? "rescheduled" : "cancelled"} online because the
        permitted {period} period has ended.
      </p>
      <p className="font-paragraph text-typo-lg text-pneutral-900">Please contact the hospital for assistance.</p>
      <Rows>
        <Row label="Appointment Reference" value={appointment.reference} />
        <Row label="Doctor Name" value={doctor.name} />
        <Row label="Appointment Date" value={formatDate(appointment.date)} />
        <Row label="Appointment Time" value={formatTime(appointment.time)} last />
      </Rows>
      <PinnedAction>
        <Button variant="outlined" size="lg" shape="responsive" onClick={() => router.push("/manage-appointment/details")} className="w-full lg:w-[108px]">
          Back
        </Button>
      </PinnedAction>
    </ManagePage>
  );
}
