"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/forgot-password/mock-api";
import { formatClock, useCountdown } from "./use-countdown";

type ResendOtpProps = {
  /** Sends a new code. The countdown restarts once it resolves. */
  onResend: () => Promise<void>;
};

/**
 * Figma "Resend Timer": "Resend OTP in 00:30" counts down, then becomes
 * "Didn't receive the code?" + a "Resend OTP" text button (which restarts it).
 */
export function ResendOtp({ onResend }: ResendOtpProps) {
  const { remaining, ready, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setPending(true);
    try {
      await onResend();
      setSent(true);
      restart();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {ready ? (
        <>
          <p className="font-paragraph text-typo-md text-pneutral-700">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="text"
            size="md"
            shape="responsive"
            loading={pending}
            onClick={handleResend}
          >
            Resend OTP
          </Button>
        </>
      ) : (
        // Not live: it changes every second. The status below announces the changes that matter.
        <p className="font-paragraph text-typo-md text-pneutral-700">
          Resend OTP in {formatClock(remaining)}
        </p>
      )}
      <span role="status" className="sr-only">
        {ready ? "You can now request a new code." : sent ? "A new code has been sent." : ""}
      </span>
    </div>
  );
}
