import type { Metadata } from "next";
import { VerifyStep } from "@/components/booking/verify-step";

export const metadata: Metadata = {
  title: "Verify your consultation",
  description: "Verify the earlier appointment or the referral for your follow-up or referral consultation.",
};

// Booking step 3 of 4, for follow-up and referral consultations only (Figma G-01.05A / G-01.05B).
export default function VerifyPage() {
  return <VerifyStep />;
}
