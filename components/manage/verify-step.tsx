"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { BookingSkeleton } from "@/components/booking/booking-layout";
import { FormActions } from "@/components/booking/form-parts";
import { OtpInput } from "@/components/ui/otp-input";
import { maskMobile } from "@/lib/appointments/rules";
import { MOCK_OTP, OTP_LENGTH, delay } from "@/lib/booking/patient";
import { manageStore } from "@/lib/manage/store";
import { useManageGuard } from "@/lib/manage/use-manage-guard";
import { ManagePage } from "./manage-page";

const RESEND_SECONDS = 30;
const TITLE = "Verify Your Mobile Number";

const clock = (seconds: number) => `00:${String(seconds).padStart(2, "0")}`;

/**
 * Manage step 2 of 4 — Figma G-02.02 "Verify Your Mobile Number" (desktop 170:58266, mobile
 * 170:58624; Invalid OTP 177:71683 / 177:72017). The OTP field has the four designed states (empty,
 * typing, complete ✓, error) and the resend timer ("Resend OTP in 00:30" → "Didn't receive the
 * code? Resend OTP"). Mock code: 482916.
 */
export function VerifyMobileStep() {
  const guard = useManageGuard({ needsVerified: false });
  if (!guard) return <BookingSkeleton step={2} title={TITLE} />;
  return <VerifyMobileForm mobile={guard.session.mobile} verified={guard.session.verified} />;
}

function VerifyMobileForm({ mobile, verified }: { mobile: string; verified: boolean }) {
  const router = useRouter();
  const ids = useId();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState(`A code was sent to ${maskMobile(mobile)}.`);

  useEffect(() => {
    if (verified) router.replace("/manage-appointment/details");
  }, [verified, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code.`);
      document.getElementById(`${ids}-otp`)?.focus();
      return;
    }
    setBusy(true);
    await delay(800);
    setBusy(false);
    if (otp !== MOCK_OTP) {
      setError("Incorrect code. Please check and try again.");
      document.getElementById(`${ids}-otp`)?.focus();
      return;
    }
    manageStore.update({ verified: true });
    router.push("/manage-appointment/details");
  }

  const resend = () => {
    setOtp("");
    setError("");
    setSeconds(RESEND_SECONDS);
    setStatus(`A new code was sent to ${maskMobile(mobile)}.`);
  };

  return (
    <ManagePage
      step={2}
      title={TITLE}
      description={`Enter the one-time code sent to ${maskMobile(mobile)}.`}
      crumb="Verify Your Mobile Number"
      label="Verify your mobile number"
      actionBar
      onSubmit={submit}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
      <div className="flex flex-col gap-2">
        <OtpInput
          id={`${ids}-otp`}
          value={otp}
          error={error || undefined}
          onChange={(digits) => {
            setOtp(digits);
            setError("");
          }}
        />
        {seconds > 0 ? (
          <p className="font-paragraph text-typo-md text-pneutral-700">Resend OTP in {clock(seconds)}</p>
        ) : (
          <p className="flex flex-wrap items-center gap-x-3 font-paragraph text-typo-md text-pneutral-700">
            Didn&apos;t receive the code?
            <button
              type="button"
              onClick={resend}
              className="rounded-xsm font-heading font-medium text-primary-800 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700"
            >
              Resend OTP
            </button>
          </p>
        )}
      </div>
      <FormActions
        bar="roomy"
        onBack={() => router.push("/manage-appointment")}
        continueLabel="Verify OTP"
        loading={busy}
      />
    </ManagePage>
  );
}
