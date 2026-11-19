import type { Metadata } from "next";
import { RescheduleStep } from "@/components/manage/reschedule-step";

export const metadata: Metadata = {
  title: "Reschedule Appointment",
  description: "Choose a new date and time for your appointment.",
};

// Manage appointment (Figma G-02.04). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function ReschedulePage() {
  return <RescheduleStep />;
}
