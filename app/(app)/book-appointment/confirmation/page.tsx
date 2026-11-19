import type { Metadata } from "next";
import { ConfirmationStep } from "@/components/booking/confirmation-step";

export const metadata: Metadata = {
  title: "Appointment Booked Successfully",
  description: "Your appointment is booked. Keep the reference to view or manage it.",
};

// Booking confirmation (Figma G-01.08). Reachable only after a booking was confirmed.
export default function ConfirmationPage() {
  return <ConfirmationStep />;
}
