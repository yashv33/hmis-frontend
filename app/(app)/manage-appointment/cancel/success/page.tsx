import type { Metadata } from "next";
import { CancelSuccessStep } from "@/components/manage/cancel-success-step";

export const metadata: Metadata = {
  title: "Appointment Cancelled Successfully",
  description: "Your appointment has been cancelled.",
};

// Manage appointment (Figma G-03.07). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function CancelSuccessPage() {
  return <CancelSuccessStep />;
}
