"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FlowActions } from "@/components/flow/flow-actions";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { updateFlow } from "@/lib/forgot-password/flow-store";
import { requestOtp } from "@/lib/forgot-password/mock-api";
import { normalizeMobile, validateMobileNumber } from "@/lib/login/validation";

const NOT_FOUND_MESSAGE = "No account is registered with this number.";

/**
 * Screen A — "R-01.01A Forgot Password" (+ "Account Not Found").
 * Validates the number, "sends" an OTP (mock) and moves on to /forgot-password/verify.
 */
export function MobileNumberForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string>();
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const message = validateMobileNumber(mobile);
    setNotFound(false);
    setError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    const normalized = normalizeMobile(mobile);
    try {
      const result = await requestOtp(normalized);
      if (!result.ok) {
        setNotFound(true);
        setSubmitting(false);
        inputRef.current?.focus();
        return;
      }
      updateFlow({ mobile: normalized, otpVerified: false, resetComplete: false });
      // Stay in the loading state until the next screen has taken over.
      router.push("/forgot-password/verify");
    } catch {
      setError("Something went wrong. Please try again");
      setSubmitting(false);
    }
  }

  const showHint = !error && !notFound;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="flex flex-col gap-6"
    >
      {notFound && (
        <Callout tone="error" title="We couldn't find an account">
          Check the number, or continue as a guest to book an appointment.
        </Callout>
      )}

      <Input
        ref={inputRef}
        name="mobile"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label="Registered Mobile Number"
        placeholder="+91 98765 43210"
        required
        readOnly={submitting}
        value={mobile}
        onChange={(event) => {
          setMobile(event.target.value);
          setError(undefined);
          setNotFound(false);
        }}
        error={error ?? (notFound ? NOT_FOUND_MESSAGE : undefined)}
        aria-describedby={showHint ? "mobile-hint" : undefined}
      />

      {/* Figma drops this line when the field is in its error state. */}
      {showHint && (
        <p id="mobile-hint" className="font-paragraph text-typo-md text-pneutral-700">
          Use the number linked to your Patient Web Portal account.
        </p>
      )}

      <FlowActions>
        <Button href="/login" variant="outlined" shape="responsive">
          Back to Login
        </Button>
        <Button
          type="submit"
          shape="responsive"
          iconRight={<Icon name="arrow-right-outline" />}
          loading={submitting}
          className="flex-1 lg:flex-none"
        >
          Send OTP
        </Button>
      </FlowActions>
    </form>
  );
}
