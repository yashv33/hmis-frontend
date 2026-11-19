import type { Metadata } from "next";
import { FindAppointmentStep } from "@/components/manage/find-step";

export const metadata: Metadata = {
  title: "Find Your Appointment",
  description: "Find your booking with its reference and the mobile number used for booking.",
};

// Manage appointment (Figma G-02.01). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function FindAppointmentPage() {
  return <FindAppointmentStep />;
}
