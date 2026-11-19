import type { Metadata } from "next";
import { RescheduleSuccessStep } from "@/components/manage/reschedule-success-step";

export const metadata: Metadata = {
  title: "Appointment Rescheduled Successfully",
  description: "Your appointment has been moved.",
};

// Manage appointment (Figma G-02.07). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function RescheduleSuccessPage() {
  return <RescheduleSuccessStep />;
}
