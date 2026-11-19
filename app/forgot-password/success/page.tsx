import type { Metadata } from "next";
import { FlowLayout } from "@/components/flow/flow-layout";
import { SuccessHeader } from "@/components/flow/page-header";
import { ResetSuccess } from "@/components/forgot-password/reset-success";

export const metadata: Metadata = {
  title: "Password Reset Successfully",
};

// Figma "R-01.01D Password Reset Successfully" — desktop 283:157912, mobile 283:158254
export default function PasswordResetSuccessPage() {
  return (
    <FlowLayout
      safetyNotice={false}
      header={
        <SuccessHeader
          title="Password reset successfully."
          description="You can now log in with your new password."
        />
      }
    >
      <ResetSuccess />
    </FlowLayout>
  );
}
