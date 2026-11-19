"use client";

import { useSyncExternalStore } from "react";
import type { Hospital } from "@/lib/find-doctor/types";
import type { BookingFor, ConsultationMode, ConsultationType } from "@/lib/booking/store";

/**
 * Mock appointments "database" for the manage flows (G-02 Reschedule, G-03 Cancel). Seeded demo
 * appointments plus every booking confirmed in this browser; changes (reschedule, cancel) are kept
 * in localStorage so all tabs agree. Not part of the booking draft: an appointment outlives it.
 */

export type AppointmentStatus = "confirmed" | "rescheduled" | "cancelled";
export type PaymentStatus = "paid" | "due" | "refund-initiated";

export type AppointmentPatient = {
  name: string;
  status: "existing" | "new";
  /** UHID of an existing patient. */
  uhid: string | null;
  /** Provisional registration ID given to a new patient at booking (TPRxxxxxx). */
  registrationId: string | null;
  age: number;
  gender: string;
};

export type Appointment = {
  /** "APT000123" (booked here) or "TMH-260511-0042" (older format still accepted). */
  reference: string;
  status: AppointmentStatus;
  doctorId: string;
  hospital: Hospital;
  consultationType: ConsultationType;
  mode: ConsultationMode;
  /** ISO date + 24h time of the current slot. */
  date: string;
  time: string;
  bookingFor: BookingFor;
  patient: AppointmentPatient;
  /** Booking contact mobile (10 digits) — the number the manage OTP is sent to. */
  mobile: string;
  fee: number;
  /** Last day this appointment may be moved to (follow-up / referral validity), or null. */
  eligibleUntil: string | null;
  paymentStatus: PaymentStatus;
  /** The slot before the latest reschedule. */
  previous: { date: string; time: string } | null;
  rescheduleCount: number;
  /** Set when cancelled: the reason, the refund promised, and the day it was cancelled (ISO). */
  cancellation: { reason: string; refund: number; cancelledAt: string } | null;
};

const KEY = "tiameds.appointments";
const listeners = new Set<() => void>();

const SAMPLE_PATIENT: AppointmentPatient = {
  name: "Rajesh Kumar",
  status: "existing",
  uhid: "APL000123",
  registrationId: null,
  age: 42,
  gender: "Male",
};

const seed = (reference: string, patch: Partial<Appointment>): Appointment => ({
  reference,
  status: "confirmed",
  doctorId: "rajesh-kumar",
  hospital: "Bengaluru",
  consultationType: "new",
  mode: "in-person",
  date: "2026-11-05",
  time: "10:30",
  bookingFor: "self",
  patient: SAMPLE_PATIENT,
  mobile: "9876543210",
  fee: 500,
  eligibleUntil: null,
  paymentStatus: "paid",
  previous: null,
  rescheduleCount: 0,
  cancellation: null,
  ...patch,
});

/**
 * Demo appointments, all booked with +91 98765 43210. Each reaches a different state of the manage
 * flows (the demo clock is Tue 3 Nov 2026, 09:00):
 *   APT000101 paid, 05 Nov        → first reschedule free, cancel with a ₹100 fee
 *   APT000102 follow-up, paid     → can only move to dates up to Sat 07 Nov ("Date Not Eligible")
 *   APT000103 new patient, due    → "Payment Due", cancel needs no refund ("Not Paid")
 *   APT000104 today 14:00         → cancel yes, rescheduling not available
 *   APT000105 today 10:00         → neither is available
 *   APT000106 already moved once  → moving it again costs ₹100 (Rescheduling Payment)
 *   APT000107 cancelled           → cancelled details with the refund note
 */
export const SEED_APPOINTMENTS: Appointment[] = [
  seed("APT000101", {}),
  seed("APT000102", { consultationType: "follow-up", eligibleUntil: "2026-11-07" }),
  seed("APT000103", {
    paymentStatus: "due",
    patient: { name: "Ananya Sharma", status: "new", uhid: null, registrationId: "TPR000045", age: 35, gender: "Female" },
  }),
  seed("APT000104", { date: "2026-11-03", time: "14:00" }),
  seed("APT000105", { date: "2026-11-03", time: "10:00" }),
  seed("APT000106", {
    status: "rescheduled",
    date: "2026-11-06",
    time: "10:00",
    previous: { date: "2026-11-04", time: "09:00" },
    rescheduleCount: 1,
  }),
  seed("APT000107", {
    status: "cancelled",
    paymentStatus: "refund-initiated",
    cancellation: { reason: "Change of Plans", refund: 400, cancelledAt: "2026-10-30" },
  }),
];

function readStored(): Record<string, Appointment> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Appointment>) : {};
  } catch {
    return {};
  }
}

let cachedRaw: string | null | undefined;
let cachedList: Appointment[] = SEED_APPOINTMENTS;

/** Seeds overlaid with this browser's bookings and changes (by reference). */
export function listAppointments(): Appointment[] {
  let raw: string | null = null;
  try {
    raw = typeof window === "undefined" ? null : window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    const stored = readStored();
    const merged = new Map(SEED_APPOINTMENTS.map((a) => [a.reference, a]));
    for (const appointment of Object.values(stored)) merged.set(appointment.reference, appointment);
    cachedList = [...merged.values()];
  }
  return cachedList;
}

export const getAppointment = (reference: string | null | undefined) =>
  reference ? listAppointments().find((a) => a.reference === reference.trim().toUpperCase()) : undefined;

/** The lookup on "Find Your Appointment": reference and booking-contact mobile must both match. */
export const findAppointment = (reference: string, mobile: string) => {
  const appointment = getAppointment(reference);
  return appointment && appointment.mobile === mobile ? appointment : undefined;
};

export function saveAppointment(appointment: Appointment) {
  try {
    const stored = readStored();
    stored[appointment.reference] = appointment;
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // storage unavailable — the change only lives for this render
  }
  listeners.forEach((listener) => listener());
}

export function updateAppointment(reference: string, patch: Partial<Appointment>) {
  const current = getAppointment(reference);
  if (current) saveAppointment({ ...current, ...patch });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Live appointment by reference (undefined while unknown or before hydration). */
export function useAppointment(reference: string | null | undefined) {
  const list = useSyncExternalStore(subscribe, listAppointments, () => SEED_APPOINTMENTS);
  return reference ? list.find((a) => a.reference === reference.trim().toUpperCase()) : undefined;
}
