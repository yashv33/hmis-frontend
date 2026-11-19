import type { Metadata } from "next";
import { ReviewStep } from "@/components/booking/review-step";

export const metadata: Metadata = {
  title: "Appointment Booking Summary",
  description: "Check the details and charges, then confirm your appointment.",
};

// Booking step 4 of 4 (Figma G-01.06).
export default function ReviewPage() {
  return <ReviewStep />;
}
