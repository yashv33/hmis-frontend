"use client";

import { createSessionStore } from "@/lib/session/create-store";

/** The slot chosen on "Reschedule Appointment", kept while the review and payment steps run. */
export type RescheduleDraft = { reference: string; date: string | null; time: string | null };
export const rescheduleStore = createSessionStore<RescheduleDraft>("tiameds.reschedule", {
  reference: "",
  date: null,
  time: null,
});

/** The reason picked on "Cancel Appointment". */
export type CancelDraft = { reference: string; reason: string; other: string };
export const cancelStore = createSessionStore<CancelDraft>("tiameds.cancel", {
  reference: "",
  reason: "",
  other: "",
});

/** Cancellation reasons, in the order Figma lists them. */
export const CANCELLATION_REASONS = [
  "Change of Plans",
  "Patient Unavailable",
  "Appointment No Longer Required",
  "Booked by Mistake",
  "Other",
] as const;

/** What the reason reads as on the review and confirmation screens ("Other" shows the free text). */
export const reasonLabel = (draft: CancelDraft) =>
  draft.reason === "Other" && draft.other.trim() ? draft.other.trim() : draft.reason;
