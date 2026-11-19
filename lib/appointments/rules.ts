import { addDays, formatDate, now, parseISODate } from "@/lib/booking/dates";
import { minutesOf } from "@/lib/booking/dates";
import type { Appointment } from "./store";

/**
 * Mock business rules of the manage flows. The designs fix the wording ("the permitted rescheduling
 * period has ended", "outside the follow-up period", a ₹100 fee, a ₹400 refund) but not the
 * numbers, so these are chosen to make every drawn state reachable from the seeded appointments:
 *
 *   reschedule  allowed until 24 h before the slot, at most twice; the first move is free, a second
 *               one costs ₹100 (paid appointments only)
 *   cancel      allowed until 2 h before the slot; free from 72 h out, ₹100 fee after that
 *   follow-up / referral appointments can only move to a date inside their validity window
 */
export const RESCHEDULE_CUTOFF_HOURS = 24;
export const CANCEL_CUTOFF_HOURS = 2;
export const FREE_CANCEL_HOURS = 72;
export const MAX_RESCHEDULES = 2;
export const RESCHEDULE_FEE = 100;
export const CANCELLATION_FEE = 100;

/** Hours from the (pinned) current time to the start of the appointment. */
export function hoursUntil(appointment: Pick<Appointment, "date" | "time">) {
  const start = parseISODate(appointment.date);
  start.setHours(0, minutesOf(appointment.time), 0, 0);
  return (start.getTime() - now().getTime()) / 36e5;
}

const open = (a: Appointment) => a.status === "confirmed" || a.status === "rescheduled";

export const canReschedule = (a: Appointment) =>
  open(a) && hoursUntil(a) >= RESCHEDULE_CUTOFF_HOURS && a.rescheduleCount < MAX_RESCHEDULES;

export const canCancel = (a: Appointment) => open(a) && hoursUntil(a) >= CANCEL_CUTOFF_HOURS;

/** Amount the person has paid so far (nothing while the fee is still due at the hospital). */
export const amountPaid = (a: Appointment) => (a.paymentStatus === "paid" ? a.fee : 0);

export const reschedulingFee = (a: Appointment) =>
  a.paymentStatus === "paid" && a.rescheduleCount >= 1 ? RESCHEDULE_FEE : 0;

export function cancellationTerms(a: Appointment) {
  const paid = amountPaid(a);
  if (a.paymentStatus !== "paid") return { paid: 0, fee: 0, refund: 0, notPaid: true as const };
  const fee = hoursUntil(a) < FREE_CANCEL_HOURS ? Math.min(CANCELLATION_FEE, paid) : 0;
  return { paid, fee, refund: paid - fee, notPaid: false as const };
}

/** Last day a follow-up / referral appointment may be moved to (null = no restriction). */
export const eligibleUntil = (a: Appointment) => a.eligibleUntil;

export function dateEligibility(a: Appointment, iso: string): { ok: true } | { ok: false; message: string } {
  const limit = a.eligibleUntil;
  if (limit && iso > limit) {
    const period = a.consultationType === "referral" ? "referral validity period" : "follow-up period";
    return {
      ok: false,
      message: `${formatDate(iso)} is outside the ${period} for this appointment. Please select another eligible date.`,
    };
  }
  return { ok: true };
}

/** First date a rescheduled appointment may use: after the cut-off from now. */
export const earliestRescheduleDate = () => addDays(now(), 0);

/** Masked mobile for messages: "+91 98XXX XX210". */
export const maskMobile = (digits: string) =>
  digits.length === 10 ? `+91 ${digits.slice(0, 2)}XXX XX${digits.slice(7)}` : "";
