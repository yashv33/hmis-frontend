import type { Metadata } from "next";
import { BookingForStep } from "@/components/booking/booking-for-step";

export const metadata: Metadata = {
  title: "Who is this appointment for?",
  description: "Tell us whether you are booking for yourself or for someone else.",
};

// Booking step 3 of 4 (Figma G-01.03). Guarded: opening it without the earlier steps sends the
// visitor back to the first incomplete step.
export default function BookingForPage() {
  return <BookingForStep />;
}
