"use client";

import { getDoctor } from "@/lib/find-doctor/doctors";
import type { Doctor, Hospital } from "@/lib/find-doctor/types";
import { createSessionStore } from "@/lib/session/create-store";
import { nextAvailableSlot } from "./availability";

export type ConsultationType = "new" | "follow-up" | "referral";
export type ConsultationMode = "in-person" | "video";
export type BookingFor = "self" | "someone-else";

export const CONSULTATION_TYPES: { value: ConsultationType; title: string; description: string }[] = [
  { value: "new", title: "New Consultation", description: "First visit for this concern" },
  {
    value: "follow-up",
    title: "Follow-up Consultation",
    description: "Seeing this doctor again for the same concern",
  },
  { value: "referral", title: "Referral Consultation", description: "Referred by another doctor" },
];

export const CONSULTATION_MODES: { value: ConsultationMode; title: string; description: string }[] = [
  { value: "in-person", title: "In-person", description: "Visit the doctor at the hospital" },
  { value: "video", title: "Video Consultation", description: "Consult online from wherever you are" },
];

/** Only "Mother" and "Other" are drawn; the rest of the list is mock data. */
export const RELATIONSHIPS = [
  "Mother",
  "Father",
  "Spouse",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandparent",
  "Other",
] as const;

export const bookingForLabel = (draft: BookingDraft) =>
  draft.bookingFor === "self" ? "Myself" : "Someone Else";

export const consultationTypeLabel = (type: ConsultationType) =>
  CONSULTATION_TYPES.find((option) => option.value === type)!.title;
export const consultationModeLabel = (mode: ConsultationMode) =>
  mode === "in-person" ? "In-person" : "Video";

/** The patient as verified on the Patient details step. */
export type PatientRecord = {
  status: "existing" | "new";
  name: string;
  /** The UHID of an existing patient; a new patient gets a temporary ID when the booking is made. */
  uhid: string | null;
  age: number;
  gender: string;
  /** Booking contact mobile, 10 digits, verified by OTP. */
  mobile: string;
  /** New patients: what was typed (kept so Back and Forward restore the form). */
  dob?: string;
  guardian?: string;
  contactName?: string;
  email?: string;
};

export type BookingConfirmation = {
  /** "APT000123". */
  reference: string;
  paymentStatus: "paid" | "due";
  /** "TPR000045" — the provisional registration ID a new patient gets when the booking is made. */
  registrationId: string | null;
};

/**
 * One booking in progress, shared by every step and kept in sessionStorage so back/forward and
 * a refresh don't lose it (a new tab starts afresh).
 */
export type BookingDraft = {
  doctorId: string | null;
  hospital: Hospital | null;
  consultationType: ConsultationType;
  mode: ConsultationMode;
  /** ISO date and 24h time of the chosen slot. */
  date: string | null;
  time: string | null;
  bookingFor: BookingFor | null;
  /** "Someone Else" only: relationship to the patient, and the free-text one for "Other". */
  relationship: string;
  otherRelationship: string;
  patient: PatientRecord | null;
  /** Verified previous-appointment / referral reference (follow-up and referral only). */
  verification: { reference: string; /** ISO last day of the follow-up / referral validity. */ validUntil?: string } | null;
  /** Ticked on the summary and confirmed with "Confirm Appointment". */
  consent: boolean;
  confirmation: BookingConfirmation | null;
};

export const EMPTY_BOOKING: BookingDraft = {
  doctorId: null,
  hospital: null,
  consultationType: "new",
  mode: "in-person",
  date: null,
  time: null,
  bookingFor: null,
  relationship: "",
  otherRelationship: "",
  patient: null,
  verification: null,
  consent: false,
  confirmation: null,
};

export const bookingStore = createSessionStore<BookingDraft>("tiameds.booking", EMPTY_BOOKING);

export const useBooking = bookingStore.useStore;
export const updateBooking = (patch: Partial<BookingDraft>) => bookingStore.update(patch);
export const clearBooking = () => bookingStore.clear();

/** Starts a new booking for a doctor, on their first free day, with the design's defaults. */
export function beginBooking(doctor: Doctor) {
  bookingStore.write({
    ...EMPTY_BOOKING,
    doctorId: doctor.id,
    hospital: doctor.hospital,
    date: nextAvailableSlot(doctor)?.date ?? null,
  });
}

/** The doctor a draft is for, if they can still be booked online. */
export function bookingDoctor(draft: BookingDraft) {
  const doctor = getDoctor(draft.doctorId);
  return doctor && doctor.nextAvailable ? doctor : undefined;
}

/* ------------------------------------------------------------------------------------------ */
/* Steps                                                                                       */
/* ------------------------------------------------------------------------------------------ */

export const BOOKING_ROUTES = {
  details: "/book-appointment",
  bookingFor: "/book-appointment/booking-for",
  patient: "/book-appointment/patient-details",
  verify: "/book-appointment/verify",
  review: "/book-appointment/review",
  payment: "/book-appointment/payment",
  confirmation: "/book-appointment/confirmation",
} as const;

export type BookingRoute = keyof typeof BOOKING_ROUTES;

const ORDER: BookingRoute[] = [
  "details",
  "bookingFor",
  "patient",
  "verify",
  "review",
  "payment",
  "confirmation",
];

const needsVerification = (draft: BookingDraft) => draft.consultationType !== "new";

/** The first step whose data is missing (where a draft resumes). */
export function resumeStep(draft: BookingDraft): BookingRoute | null {
  if (!bookingDoctor(draft)) return null;
  if (draft.confirmation) return "confirmation";
  if (!draft.hospital || !draft.date || !draft.time) return "details";
  if (!draft.bookingFor) return "bookingFor";
  if (!draft.patient) return "patient";
  if (needsVerification(draft) && !draft.verification) return "verify";
  if (!draft.consent) return "review";
  return "payment";
}

/** Where to send someone who opens a step they can't see yet. */
export const resumeHref = (draft: BookingDraft) => {
  const step = resumeStep(draft);
  return step ? BOOKING_ROUTES[step] : "/find-doctor";
};

/**
 * A step can be opened once every earlier step is complete. Verification only exists for
 * follow-up and referral consultations, and a confirmed booking can only show its confirmation.
 */
export function canOpenStep(step: BookingRoute, draft: BookingDraft) {
  const resume = resumeStep(draft);
  if (!resume) return false;
  if (resume === "confirmation") return step === "confirmation";
  if (step === "confirmation") return false;
  if (step === "verify" && !needsVerification(draft)) return false;
  return ORDER.indexOf(step) <= ORDER.indexOf(resume);
}

/** The step after this one ("Continue"). */
export function nextStep(step: BookingRoute, draft: BookingDraft): BookingRoute {
  const after = ORDER[ORDER.indexOf(step) + 1];
  return after === "verify" && !needsVerification(draft) ? "review" : after;
}

/** The step before this one ("Back"); `null` from the first step (back to Find a Doctor). */
export function previousStep(step: BookingRoute, draft: BookingDraft): BookingRoute | null {
  const index = ORDER.indexOf(step);
  if (index <= 0) return null;
  const before = ORDER[index - 1];
  return before === "verify" && !needsVerification(draft) ? "patient" : before;
}
