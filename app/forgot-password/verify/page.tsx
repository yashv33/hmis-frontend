import type { Metadata } from "next";
import { FlowLayout } from "@/components/flow/flow-layout";
import { PageHeader } from "@/components/flow/page-header";
import { OtpForm } from "@/components/forgot-password/otp-form";

export const metadata: Metadata = {
  title: "Verify Your Mobile Number",
};

// Figma "R-01.01B Forgot Password - Verify OTP" — desktop 283:156373, mobile 283:156748
// (+ "Resend Available" 283:160428 / 283:160670, shown once the 30s countdown ends).
export default function VerifyOtpPage() {
  return (
    <FlowLayout
      header={
        <PageHeader
          title="Verify Your Mobile Number"
          description="Enter the code to confirm it's you."
        />
      }
    >
      <OtpForm />
    </FlowLayout>
  );
}
