"use client";

import { bookingStore, clearBooking as clearDraft } from "@/lib/booking/store";

/**
 * "Appointment booking in progress": a booking has been started and not confirmed yet. Logging
 * out then shows the "Your appointment booking isn't finished…" variant of the confirmation
 * (Figma "Logout Confirmation - Booking In Progress"). Derived from the booking store.
 */
export function useBookingInProgress() {
  const draft = bookingStore.useStore();
  return Boolean(draft.doctorId) && !draft.confirmation;
}

export const clearBooking = clearDraft;
