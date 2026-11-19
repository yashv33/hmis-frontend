import type { Metadata } from "next";
import { FlowLayout } from "@/components/flow/flow-layout";
import { PageHeader } from "@/components/flow/page-header";
import { ResetPasswordForm } from "@/components/forgot-password/reset-password-form";

export const metadata: Metadata = {
  title: "Create a New Password",
};

// Figma "R-01.01C Reset Password" — desktop 283:156852, mobile 283:157246
// (+ "Passwords Don't Match" 283:157369 / 283:157776, shown on a mismatch).
export default function ResetPasswordPage() {
  return (
    <FlowLayout
      header={
        <PageHeader
          title="Create a New Password"
          description="Choose a new password for your portal account."
        />
      }
    >
      <ResetPasswordForm />
    </FlowLayout>
  );
}
