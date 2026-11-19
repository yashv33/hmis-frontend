import type { Metadata } from "next";
import { CancelStep } from "@/components/manage/cancel-step";

export const metadata: Metadata = {
  title: "Cancel Appointment",
  description: "Tell us why you want to cancel.",
};

// Manage appointment (Figma G-03.04). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function CancelPage() {
  return <CancelStep />;
}
