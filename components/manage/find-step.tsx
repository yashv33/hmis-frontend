"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupAppointment } from "@/lib/appointments/api";
import { formatMobile, isValidMobile, mobileDigits } from "@/lib/booking/patient";
import { REFERENCE_PATTERN, manageStore, normalizeReference } from "@/lib/manage/store";
import { ManagePage, PinnedAction } from "./manage-page";

/**
 * Manage step 1 of 4 — Figma G-02.01 "Find Your Appointment" (desktop 170:57807, mobile 170:58162;
 * Not Found 177:72109 / 177:72416). The appointment is found by reference and the mobile number
 * used for booking; the same answer ("couldn't find…") covers a wrong reference and a wrong number.
 */
export function FindAppointmentStep() {
  const router = useRouter();
  const ids = useId();
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<{ reference?: string; mobile?: string; notFound?: boolean }>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const ref = normalizeReference(reference);
    const digits = mobileDigits(mobile);
    const next = {
      reference: !ref
        ? "Enter your appointment reference."
        : REFERENCE_PATTERN.test(ref)
          ? undefined
          : "Check the appointment reference",
      mobile: isValidMobile(digits) ? undefined : "Enter a valid 10-digit mobile number.",
    };
    setErrors(next);
    if (next.reference || next.mobile) {
      document.getElementById(next.reference ? `${ids}-reference` : `${ids}-mobile`)?.focus();
      return;
    }
    setBusy(true);
    const found = await lookupAppointment(ref, digits);
    setBusy(false);
    if (!found) {
      setErrors({
        reference: "Check the appointment reference",
        mobile: "This number doesn't match the booking",
        notFound: true,
      });
      document.getElementById(`${ids}-reference`)?.focus();
      return;
    }
    manageStore.write({ reference: ref, mobile: digits, verified: false });
    router.push("/manage-appointment/verify");
  }

  return (
    <ManagePage
      step={1}
      title="Find Your Appointment"
      description="Enter your appointment reference and the mobile number used for booking."
      crumb="Find Your Appointment"
      label="Find your appointment"
      actionBar="single"
      onSubmit={submit}
    >
      <div className="flex flex-col gap-6">
        {errors.notFound && (
          <p role="alert" className="rounded-sm bg-warning-50 px-4 py-4 font-heading text-typo-md text-warning-600">
            We couldn&apos;t find an appointment with these details. Check the reference and the mobile number
            used for booking, then try again.
          </p>
        )}
        <Input
          id={`${ids}-reference`}
          label="Appointment Reference"
          required
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="e.g. APT000123"
          value={reference}
          error={errors.reference}
          onChange={(event) => {
            setReference(event.target.value);
            setErrors({});
          }}
        />
        <Input
            id={`${ids}-mobile`}
            label="Booking Contact Mobile Number"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="+91 Mobile number"
            value={formatMobile(mobileDigits(mobile))}
            error={errors.mobile}
            onChange={(event) => {
              setMobile(mobileDigits(event.target.value));
              setErrors({});
            }}
          />
        <p className="font-paragraph text-typo-md text-pneutral-700">
          We&apos;ll send a one-time code to this number to confirm it&apos;s you.
        </p>
      </div>
      <PinnedAction>
        <Button type="submit" size="lg" shape="responsive" loading={busy} className="w-full lg:w-[199px]">
          Find Appointment
        </Button>
      </PinnedAction>
    </ManagePage>
  );
}
