import type { Doctor } from "@/lib/find-doctor/types";
import type { BookingDraft } from "./store";

export type PaymentRequirement = "pay-now" | "pay-at-hospital";

export const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

/**
 * The charges drawn on the summary and payment screens: consultation fee, discount, and tax that
 * "is confirmed by billing", so the total is "₹500 + applicable tax" rather than a number.
 */
export function chargesFor(doctor: Doctor) {
  const fee = doctor.fee;
  const discount = 0;
  return {
    fee,
    discount,
    total: fee - discount,
    totalLabel: `${rupees(fee - discount)} + applicable tax`,
  };
}

/**
 * Mock rule, from the notes on the confirmation card in Figma: an existing patient (UHID) pays online
 * ("Paid"); a new patient pays at the hospital ("Payment Due", with a Provisional Registration ID).
 */
export const paymentRequirement = (draft: BookingDraft): PaymentRequirement =>
  draft.patient?.status === "new" ? "pay-at-hospital" : "pay-now";

export const paymentRequirementLabel = (requirement: PaymentRequirement) =>
  requirement === "pay-now" ? "Pay Now" : "Pay at Hospital";
