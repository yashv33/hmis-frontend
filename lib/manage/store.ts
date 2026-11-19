"use client";

import { createSessionStore } from "@/lib/session/create-store";

/**
 * The appointment being managed (G-02 Reschedule / G-03 Cancel): what the visitor typed into
 * "Find Your Appointment", and whether the booking-contact mobile has been confirmed by OTP.
 * Kept in sessionStorage, so verification lasts for this tab only.
 */
export type ManageSession = { reference: string; mobile: string; verified: boolean };

const EMPTY: ManageSession = { reference: "", mobile: "", verified: false };
export const manageStore = createSessionStore<ManageSession>("tiameds.manage-lookup", EMPTY);

/**
 * Appointment references: "APT000123" (issued by online booking, as on the confirmation screen) or
 * the older "TMH-260511-0042" format shown as the example in the Manage dialog.
 */
export const REFERENCE_PATTERN = /^(APT\d{6}|TMH-\d{6}-\d{4})$/;

export const normalizeReference = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, "");

/** Marks an appointment as already verified (the person just booked it with a verified mobile). */
export function startVerifiedSession(reference: string, mobile: string) {
  manageStore.write({ reference, mobile, verified: true });
}
