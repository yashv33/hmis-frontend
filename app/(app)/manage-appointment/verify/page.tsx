import type { Metadata } from "next";
import { VerifyMobileStep } from "@/components/manage/verify-step";

export const metadata: Metadata = {
  title: "Verify Your Mobile Number",
  description: "Confirm it is you with a one-time code.",
};

// Manage appointment (Figma G-02.02). Public: reached with an appointment reference and the booking
// contact mobile, confirmed by OTP.
export default function VerifyMobilePage() {
  return <VerifyMobileStep />;
}
