import type { Metadata } from "next";
import { FlowLayout } from "@/components/flow/flow-layout";
import { PageHeader } from "@/components/flow/page-header";
import { MobileNumberForm } from "@/components/forgot-password/mobile-number-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your TiaMeds patient portal password.",
};

// Figma "R-01.01A Forgot Password" — desktop 283:155369, mobile 283:155748
// (+ "Account Not Found" 283:155851 / 283:156257, shown after a failed lookup).
export default function ForgotPasswordPage() {
  return (
    <FlowLayout
      header={
        <PageHeader
          title="Forgot Password"
          description="Enter your registered mobile number and we'll send you a one-time code."
        />
      }
    >
      <MobileNumberForm />
    </FlowLayout>
  );
}
