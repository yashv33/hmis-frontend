"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DetailRows } from "@/components/flow/detail-rows";
import { FlowActions } from "@/components/flow/flow-actions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OtpInput } from "@/components/ui/otp-input";
import { SAMPLE_MOBILE, updateFlow, useDisplayMobile, useFlow } from "@/lib/forgot-password/flow-store";
import { requestOtp, verifyOtp } from "@/lib/forgot-password/mock-api";
import { validateOtp } from "@/lib/forgot-password/validation";
import { ResendOtp } from "./resend-otp";

const INCORRECT_CODE = "Incorrect code. Please check and try again.";

/**
 * Screen B — "R-01.01B Verify OTP" (+ "Resend Available").
 * One 6-digit field, a resend countdown, and Verify OTP → /forgot-password/reset.
 */
export function OtpForm() {
  const router = useRouter();
  const { mobile } = useFlow();
  const displayMobile = useDisplayMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // The code field is the only thing to do here, so it gets focus on arrival.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const message = validateOtp(otp);
    setError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyOtp(mobile ?? SAMPLE_MOBILE, otp);
      if (!result.ok) {
        setError(INCORRECT_CODE);
        setSubmitting(false);
        inputRef.current?.focus();
        return;
      }
      updateFlow({ otpVerified: true });
      router.push("/forgot-password/reset");
    } catch {
      setError("Something went wrong. Please try again");
      setSubmitting(false);
    }
  }

  async function handleResend() {
    await requestOtp(mobile ?? SAMPLE_MOBILE);
    setOtp("");
    setError(undefined);
    inputRef.current?.focus();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="flex flex-col gap-6"
    >
      <DetailRows rows={[{ label: "Mobile Number", value: displayMobile }]} />

      <div className="flex flex-col gap-3 rounded-sm bg-secondary-50 p-4">
        <p id="otp-intro" className="font-paragraph text-typo-md text-pneutral-900">
          Enter the 6-digit code sent to {displayMobile}.
        </p>
        <OtpInput
          ref={inputRef}
          value={otp}
          onChange={(digits) => {
            setOtp(digits);
            setError(undefined);
          }}
          error={error}
          readOnly={submitting}
          aria-describedby="otp-intro"
        />
        <ResendOtp onResend={handleResend} />
      </div>

      <FlowActions>
        <Button href="/forgot-password" variant="outlined" shape="responsive">
          Back
        </Button>
        <Button
          type="submit"
          shape="responsive"
          iconRight={<Icon name="arrow-right-outline" />}
          loading={submitting}
          className="flex-1 lg:flex-none"
        >
          Verify OTP
        </Button>
      </FlowActions>
    </form>
  );
}
