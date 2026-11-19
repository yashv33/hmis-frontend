import type { Metadata } from "next";
import { CancelReviewStep } from "@/components/manage/cancel-review-step";

export const metadata: Metadata = {
  title: "Review Appointment Cancellation",
  description: "Check the cancellation and refund details.",
};

// Manage appointment (Figma G-03.05 / G-03.06). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function CancelReviewPage() {
  return <CancelReviewStep />;
}
