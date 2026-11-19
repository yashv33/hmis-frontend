import type { Metadata } from "next";
import { PaymentStep } from "@/components/booking/payment-step";

export const metadata: Metadata = {
  title: "Confirm and Pay",
  description: "Pay online or confirm now and pay at the hospital.",
};

// Booking step 4 of 4 (Figma G-01.07). Guarded: needs the review step's consent.
export default function PaymentPage() {
  return <PaymentStep />;
}
