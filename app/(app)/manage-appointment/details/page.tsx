import type { Metadata } from "next";
import { AppointmentDetailsStep } from "@/components/manage/details-step";

export const metadata: Metadata = {
  title: "Appointment Details",
  description: "Review your appointment and the actions available for it.",
};

// Manage appointment (Figma G-02.03 / G-03.08). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function AppointmentDetailsPage() {
  return <AppointmentDetailsStep />;
}
