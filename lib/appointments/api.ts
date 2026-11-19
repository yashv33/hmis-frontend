import { isSlotAvailable } from "@/lib/booking/availability";
import { isSlotTaken, releaseSlot, takeSlot } from "@/lib/booking/booked-slots";
import { toISODate, now } from "@/lib/booking/dates";
import { delay } from "@/lib/booking/patient";
import { getDoctor } from "@/lib/find-doctor/doctors";
import { cancellationTerms } from "./rules";
import { findAppointment, updateAppointment, type Appointment } from "./store";

/**
 * Mock manage-appointment API. Every call takes a little time so loading states are visible; a
 * reference + mobile pair that doesn't match a stored appointment is "not found" (the same answer
 * for a wrong reference and a wrong number, so the screen reveals nothing about which).
 */

export async function lookupAppointment(reference: string, mobile: string): Promise<Appointment | null> {
  await delay(900);
  return findAppointment(reference, mobile) ?? null;
}

/** Moves the appointment to a new slot; fails if the slot has gone in the meantime. */
export async function rescheduleAppointment(appointment: Appointment, date: string, time: string): Promise<boolean> {
  await delay(1000);
  const doctor = getDoctor(appointment.doctorId);
  if (!doctor || !isSlotAvailable(doctor, date, time) || isSlotTaken(doctor.id, date, time)) return false;
  releaseSlot(doctor.id, appointment.date, appointment.time);
  takeSlot(doctor.id, date, time);
  updateAppointment(appointment.reference, {
    status: "rescheduled",
    date,
    time,
    previous: { date: appointment.date, time: appointment.time },
    rescheduleCount: appointment.rescheduleCount + 1,
  });
  return true;
}

/** Cancels the appointment, frees its slot and starts the refund. */
export async function cancelAppointment(appointment: Appointment, reason: string): Promise<void> {
  await delay(1800);
  const refund = cancellationTerms(appointment).refund;
  releaseSlot(appointment.doctorId, appointment.date, appointment.time);
  updateAppointment(appointment.reference, {
    status: "cancelled",
    paymentStatus: refund > 0 ? "refund-initiated" : appointment.paymentStatus,
    cancellation: { reason, refund, cancelledAt: toISODate(now()) },
  });
}
