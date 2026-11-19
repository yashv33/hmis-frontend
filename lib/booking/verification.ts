import type { Doctor } from "@/lib/find-doctor/types";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { addDays, formatDate, now, parseISODate, toISODate } from "./dates";
import { delay } from "./patient";

export type VerifyKind = "follow-up" | "referral";
export type Eligibility = "eligible" | "not-eligible" | "verification-required";

export type VerifyResult =
  | { status: "invalid"; message: string }
  | {
      status: Eligibility;
      /** Summary rows above the eligibility row. */
      rows: [string, string][];
      /** The "Follow-up Eligibility" / "Referral Eligibility" label. */
      eligibilityLabel: string;
      /** Eligible only: ISO last day of the validity window (carried into the booking). */
      validUntil?: string;
      /** Shown when eligible — after the eligibility row (follow-up) or before it (referral). */
      validityRow?: [string, string];
      validityPosition?: "before" | "after";
      /** Explanation under the summary when not eligible / verification is required. */
      message?: string;
    };

export const REFERENCE_FORMAT: Record<VerifyKind, { label: string; example: string; pattern: RegExp }> = {
  "follow-up": { label: "Previous Appointment Reference", example: "TMH-261020-0187", pattern: /^TMH-(\d{2})(\d{2})(\d{2})-(\d{4})$/ },
  referral: { label: "Referral Reference", example: "REF-2026-04417", pattern: /^REF-(\d{4})-(\d{5})$/ },
};

export const normalizeVerifyReference = (value: string) => value.trim().toUpperCase();

/**
 * Mock rules (so every state in the designs can be reached):
 *  follow-up  TMH-YYMMDD-NNNN — the earlier visit's date is in the reference. Eligible while the
 *             appointment is within 30 days of it, otherwise Not Eligible. NNNN = 9999 can't be
 *             confirmed online (Verification Required).
 *  referral   REF-YYYY-NNNNN — ends in 0 → Not Eligible, ends in 9 → Verification Required
 *             (status Pending), anything else Eligible.
 * The sample references drawn in Figma (TMH-261020-0187, REF-2026-04417) are Eligible.
 */
export async function verifyReference(
  kind: VerifyKind,
  reference: string,
  doctor: Doctor,
  appointmentDate: string,
): Promise<VerifyResult> {
  await delay(900);
  const ref = normalizeVerifyReference(reference);
  const match = REFERENCE_FORMAT[kind].pattern.exec(ref);
  if (!match) {
    return {
      status: "invalid",
      message: `Enter the reference like ${REFERENCE_FORMAT[kind].example}.`,
    };
  }

  if (kind === "follow-up") {
    const previous = new Date(2000 + Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(previous.getTime()) || previous.getMonth() !== Number(match[2]) - 1 || previous > now()) {
      return { status: "invalid", message: "That reference doesn't match a past appointment." };
    }
    const validUntil = addDays(previous, 30);
    const rows: [string, string][] = [
      ["Previous Consultation Date", formatDate(toISODate(previous))],
      ["Previous Consulting Doctor", doctor.name],
      ["Previous Consultation Hospital", hospitalName(doctor.hospital)],
    ];
    if (match[4] === "9999") {
      return {
        status: "verification-required",
        rows,
        eligibilityLabel: "Follow-up Eligibility",
        message: "We couldn't confirm this consultation online. Call our helpline, or book it as a New Consultation.",
      };
    }
    if (parseISODate(appointmentDate) > validUntil) {
      return {
        status: "not-eligible",
        rows,
        eligibilityLabel: "Follow-up Eligibility",
        message:
          "This appointment can't be booked as a follow-up because the follow-up period has ended. You can book it as a New Consultation instead.",
      };
    }
    return {
      status: "eligible",
      rows,
      eligibilityLabel: "Follow-up Eligibility",
      validUntil: toISODate(validUntil),
      validityRow: ["Follow-up Validity End Date", formatDate(toISODate(validUntil))],
      validityPosition: "after",
    };
  }

  const last = match[2].slice(-1);
  const referrer = "Dr. Meenakshi Iyer, General Medicine";
  const common = (status: string): [string, string][] => [
    ["Referring Doctor", referrer],
    ["Referral Status", status],
    ["Referred Specialty", doctor.specialty],
    ["Referred Doctor", doctor.name],
  ];
  if (last === "9") {
    return {
      status: "verification-required",
      rows: common("Pending"),
      eligibilityLabel: "Referral Eligibility",
      message: "We couldn't verify this referral online. Call our helpline, or book a New Consultation instead.",
    };
  }
  if (last === "0") {
    return {
      status: "not-eligible",
      rows: common("Active"),
      eligibilityLabel: "Referral Eligibility",
      message: "This referral can't be used for this appointment. You can book a New Consultation instead, or call us for help.",
    };
  }
  return {
    status: "eligible",
    rows: common("Active"),
    eligibilityLabel: "Referral Eligibility",
    validUntil: toISODate(addDays(now(), 27)),
    validityRow: ["Referral Validity End Date", formatDate(toISODate(addDays(now(), 27)))],
    validityPosition: "before",
  };
}
