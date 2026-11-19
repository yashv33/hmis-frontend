import { saveAppointment } from "@/lib/appointments/store";
import type { Doctor } from "@/lib/find-doctor/types";
import { isSlotAvailable } from "./availability";
import { isSlotTaken, nextSerial, takeSlot } from "./booked-slots";
import { delay } from "./patient";
import type { BookingConfirmation, BookingDraft } from "./store";

export type PaymentMethod = "upi" | "card" | "netbanking";

export const PAYMENT_METHODS: { value: PaymentMethod; title: string; description: string }[] = [
  { value: "upi", title: "UPI", description: "Pay with any UPI app" },
  { value: "card", title: "Credit or Debit Card", description: "Visa, Mastercard, RuPay" },
  { value: "netbanking", title: "Net Banking", description: "All major banks" },
];

export type BookingOutcome =
  | { status: "confirmed"; confirmation: BookingConfirmation }
  /** The bank is still confirming; `settle()` resolves once it has. */
  | { status: "pending"; settle: () => Promise<BookingOutcome> }
  | { status: "failed" };

/** Test switches: `?simulate=failed` and `?simulate=pending` on the payment page. */
export type Simulation = "failed" | "pending" | null;

function confirm(draft: BookingDraft, doctor: Doctor, paid: boolean): BookingOutcome {
  // The slot may have been taken between choosing it and paying (another tab, another visitor).
  if (!draft.date || !draft.time || !isSlotAvailable(doctor, draft.date, draft.time) || isSlotTaken(doctor.id, draft.date, draft.time)) {
    return { status: "failed" };
  }
  takeSlot(doctor.id, draft.date, draft.time);
  const reference = `APT${String(nextSerial("appointment", 123)).padStart(6, "0")}`;
  const registrationId =
    draft.patient?.status === "new" ? `TPR${String(nextSerial("registration", 45)).padStart(6, "0")}` : null;
  const patient = draft.patient!;
  // The appointment now exists on its own (manage flows read it by reference + mobile).
  saveAppointment({
    reference,
    status: "confirmed",
    doctorId: doctor.id,
    hospital: draft.hospital ?? doctor.hospital,
    consultationType: draft.consultationType,
    mode: draft.mode,
    date: draft.date,
    time: draft.time,
    bookingFor: draft.bookingFor ?? "self",
    patient: {
      name: patient.name,
      status: patient.status,
      uhid: patient.uhid,
      registrationId,
      age: patient.age,
      gender: patient.gender,
    },
    mobile: patient.mobile,
    fee: doctor.fee,
    eligibleUntil: draft.verification?.validUntil ?? null,
    paymentStatus: paid ? "paid" : "due",
    previous: null,
    rescheduleCount: 0,
    cancellation: null,
  });
  return { status: "confirmed", confirmation: { reference, paymentStatus: paid ? "paid" : "due", registrationId } };
}

/**
 * Mock booking. Pay at the hospital books straight away ("Payment Due"). Online payment succeeds,
 * except Net Banking which stays "pending" for a few seconds first (the design's "We're confirming
 * your booking"). The slot is re-checked at this point — if it has gone, the booking fails.
 */
export async function submitBooking(
  draft: BookingDraft,
  doctor: Doctor,
  options: { payment: "online"; method: PaymentMethod; simulate: Simulation } | { payment: "hospital"; simulate: Simulation },
): Promise<BookingOutcome> {
  await delay(900);
  if (options.simulate === "failed") return { status: "failed" };
  const paid = options.payment === "online";
  const slow = paid && (options.simulate === "pending" || ("method" in options && options.method === "netbanking"));
  if (slow) {
    return {
      status: "pending",
      settle: async () => {
        await delay(4000);
        return confirm(draft, doctor, true);
      },
    };
  }
  return confirm(draft, doctor, paid);
}
