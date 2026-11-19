import type { Metadata } from "next";
import { RescheduleReviewStep } from "@/components/manage/reschedule-review-step";

export const metadata: Metadata = {
  title: "Review Rescheduling Details",
  description: "Check the proposed appointment and any charges.",
};

// Manage appointment (Figma G-02.05). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function RescheduleReviewPage() {
  return <RescheduleReviewStep />;
}
