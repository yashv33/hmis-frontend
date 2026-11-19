import type { Metadata } from "next";
import { ReschedulePaymentStep } from "@/components/manage/reschedule-payment-step";

export const metadata: Metadata = {
  title: "Rescheduling Payment",
  description: "Pay the additional amount to reschedule.",
};

// Manage appointment (Figma G-02.06). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function ReschedulePaymentPage() {
  return <ReschedulePaymentStep />;
}
