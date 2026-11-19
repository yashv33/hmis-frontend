"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  GENDERS,
  OTP_LENGTH,
  ageInYears,
  ageLabel,
  checkOtp,
  formatDobInput,
  formatMobile,
  isValidEmail,
  isValidMobile,
  mobileDigits,
  parseDob,
  sendOtp,
  verifyExistingPatient,
} from "@/lib/booking/patient";
import {
  BOOKING_ROUTES,
  nextStep,
  previousStep,
  updateBooking,
  type BookingDraft,
  type PatientRecord,
} from "@/lib/booking/store";
import { useStepGuard } from "@/lib/booking/use-step-guard";
import type { Doctor } from "@/lib/find-doctor/types";
import { AppointmentSummaryCard, AppointmentSummaryMobile } from "./appointment-summary";
import { BookingHeader } from "./booking-header";
import { BookingLayout, BookingSkeleton, bookingCard } from "./booking-layout";
import { ChoiceHeading } from "./choice-heading";
import { FieldHeading, FormActions } from "./form-parts";

const TITLE = "Patient details";
const OTP_BUTTON = "mt-5 shrink-0";

type Registration = "existing" | "new";
type Busy = "send" | "verify-otp" | "verify-patient" | null;

type FormState = {
  registration: Registration | null;
  uhid: string;
  dob: string;
  mobile: string;
  otpSent: boolean;
  otp: string;
  otpVerified: boolean;
  /** The safe "couldn't verify" panel is showing. */
  verifyFailed: boolean;
  fullName: string;
  gender: string;
  guardian: string;
  contactName: string;
  email: string;
};

const blankForm = (registration: Registration | null): FormState => ({
  registration,
  uhid: "",
  dob: "",
  mobile: "",
  otpSent: false,
  otp: "",
  otpVerified: false,
  verifyFailed: false,
  fullName: "",
  gender: "",
  guardian: "",
  contactName: "",
  email: "",
});

/** Restores the form from a patient saved on an earlier visit to this step. */
function initialForm(patient: PatientRecord | null): FormState {
  if (!patient) return blankForm(null);
  const form = blankForm(patient.status);
  form.mobile = patient.mobile;
  if (patient.status === "new") {
    Object.assign(form, {
      fullName: patient.name,
      dob: patient.dob ?? "",
      gender: patient.gender,
      guardian: patient.guardian ?? "",
      contactName: patient.contactName ?? "",
      email: patient.email ?? "",
      otpSent: true,
      otp: "",
      otpVerified: true,
    });
  }
  return form;
}

type Errors = Partial<Record<keyof FormState | "registration" | "mobile" | "otp", string>>;

/**
 * Step 3 of 4 (Patient details) — Figma G-01.04 "Patient Details" (desktop 124:19269, mobile
 * 124:19737; the panel's states 124:18276). Existing patients are verified with UHID, optional date
 * of birth and a mobile number confirmed by OTP; new patients enter their details and a booking
 * contact, whose mobile is confirmed by OTP. Mock OTP: 482916.
 */
export function PatientDetailsStep() {
  const guard = useStepGuard("patient");
  if (!guard) return <BookingSkeleton step={3} title={TITLE} />;
  return <PatientDetailsForm doctor={guard.doctor} draft={guard.draft} />;
}

function PatientDetailsForm({ doctor, draft }: { doctor: Doctor; draft: BookingDraft }) {
  const router = useRouter();
  const ids = useId();
  const [form, setForm] = useState<FormState>(() => initialForm(draft.patient));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<Busy>(null);
  const [verified, setVerified] = useState<PatientRecord | null>(
    draft.patient?.status === "existing" ? draft.patient : null,
  );
  const [status, setStatus] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);

  const patch = (changes: Partial<FormState>, clear: (keyof Errors)[] = []) => {
    setForm((current) => ({ ...current, ...changes }));
    if (clear.length) setErrors((current) => ({ ...current, ...Object.fromEntries(clear.map((key) => [key, undefined])) }));
  };

  const edit = () => router.push(BOOKING_ROUTES.details);
  const back = () => router.push(BOOKING_ROUTES[previousStep("patient", draft) ?? "bookingFor"]);

  const relationship =
    draft.bookingFor === "self"
      ? "Myself"
      : draft.relationship === "Other"
        ? draft.otherRelationship.trim()
        : draft.relationship;

  const dobDate = parseDob(form.dob);
  const age = dobDate ? ageInYears(dobDate) : null;

  const chooseRegistration = (registration: Registration) => {
    if (form.registration === registration) return;
    setForm(blankForm(registration));
    setErrors({});
    setVerified(null);
    updateBooking({ patient: null });
  };

  /* ----- mobile OTP (shared by both flows) ----- */
  const sendCode = async () => {
    const digits = mobileDigits(form.mobile);
    if (!isValidMobile(digits)) {
      setErrors((current) => ({ ...current, mobile: "Enter a valid 10-digit mobile number." }));
      document.getElementById(`${ids}-mobile`)?.focus();
      return;
    }
    setBusy("send");
    await sendOtp(digits);
    setBusy(null);
    setForm((current) => ({ ...current, otpSent: true, otp: "", otpVerified: false, verifyFailed: false }));
    setStatus(`We sent a ${OTP_LENGTH}-digit code to ${formatMobile(digits)}.`);
  };

  const confirmOtp = async () => {
    if (form.otp.length !== OTP_LENGTH) {
      setErrors((current) => ({ ...current, otp: `Enter the ${OTP_LENGTH}-digit code.` }));
      document.getElementById(`${ids}-otp`)?.focus();
      return false;
    }
    setBusy("verify-otp");
    const ok = await checkOtp(form.otp);
    setBusy(null);
    if (ok) {
      patch({ otpVerified: true, verifyFailed: false }, ["otp"]);
      setStatus("Mobile number verified.");
    } else if (form.registration === "existing") {
      patch({ verifyFailed: true });
    } else {
      setErrors((current) => ({ ...current, otp: "That code isn't right. Check it and try again." }));
    }
    return ok;
  };

  /* ----- existing patient ----- */
  const verifyPatient = async () => {
    const next: Errors = {};
    if (!form.uhid.trim()) next.uhid = "Enter the patient's UHID.";
    if (form.dob && !dobDate) next.dob = "Enter a valid date as DD/MM/YYYY.";
    setErrors(next);
    if (next.uhid || next.dob) {
      document.getElementById(next.uhid ? `${ids}-uhid` : `${ids}-dob`)?.focus();
      return;
    }
    if (form.otp.length !== OTP_LENGTH) return void confirmOtp();
    setBusy("verify-patient");
    const patient = await verifyExistingPatient({
      uhid: form.uhid,
      dob: form.dob,
      mobile: mobileDigits(form.mobile),
      otp: form.otp,
    });
    setBusy(null);
    if (!patient) {
      patch({ verifyFailed: true });
      return;
    }
    const record: PatientRecord = {
      status: "existing",
      name: patient.name,
      uhid: patient.uhid,
      age: patient.age,
      gender: patient.gender,
      mobile: mobileDigits(form.mobile),
    };
    setVerified(record);
    updateBooking({ patient: record, verification: null });
    setStatus("Patient verified.");
  };

  const changePatient = () => {
    setVerified(null);
    setForm(blankForm("existing"));
    updateBooking({ patient: null });
  };

  /* ----- continue ----- */
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.registration) {
      setErrors({ registration: "Choose whether the patient is already registered." });
      document.getElementById(`${ids}-existing`)?.focus();
      return;
    }
    if (form.registration === "existing") {
      if (!verified) {
        setErrors({ uhid: form.uhid ? undefined : "Verify the patient to continue." });
        setStatus("Verify the patient to continue.");
        statusRef.current?.focus();
        return;
      }
      router.push(BOOKING_ROUTES[nextStep("patient", draft)]);
      return;
    }

    const next: Errors = {};
    if (!form.fullName.trim()) next.fullName = "Enter the patient's full name.";
    if (!dobDate) next.dob = form.dob ? "Enter a valid date as DD/MM/YYYY." : "Enter the patient's date of birth.";
    if (!form.gender) next.gender = "Select a gender.";
    if (age !== null && age < 18 && !form.guardian.trim()) next.guardian = "Enter a guardian's name for a patient under 18.";
    if (!form.contactName.trim()) next.contactName = "Enter the booking contact's name.";
    if (!isValidMobile(mobileDigits(form.mobile))) next.mobile = "Enter a valid 10-digit mobile number.";
    else if (!form.otpVerified) next.mobile = "Verify this mobile number with the code we send.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    const order: [keyof Errors, string][] = [
      ["fullName", "name"], ["dob", "dob"], ["gender", "gender"], ["guardian", "guardian"],
      ["contactName", "contact-name"], ["mobile", "mobile"], ["email", "email"],
    ];
    const first = order.find(([key]) => next[key]);
    if (first) {
      document.getElementById(`${ids}-${first[1]}`)?.focus();
      return;
    }
    const record: PatientRecord = {
      status: "new",
      name: form.fullName.trim(),
      uhid: null,
      age: age ?? 0,
      gender: form.gender,
      mobile: mobileDigits(form.mobile),
      dob: form.dob,
      guardian: form.guardian.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
    };
    updateBooking({ patient: record, verification: null });
    router.push(BOOKING_ROUTES[nextStep("patient", draft)]);
  };

  /* ----- pieces ----- */
  const mobileRow = (opts: { disabled: boolean }) => (
    <div className="flex items-start gap-3">
      <Input
        id={`${ids}-mobile`}
        label="Booking Contact Mobile Number"
        required
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="+91 Mobile number"
        value={formatMobile(mobileDigits(form.mobile))}
        disabled={opts.disabled}
        error={errors.mobile}
        trailing={form.otpVerified ? <Icon name="check-circle-micro" className="text-success-600" /> : undefined}
        onChange={(event) =>
          patch({ mobile: mobileDigits(event.target.value), otpSent: false, otp: "", otpVerified: false, verifyFailed: false }, ["mobile"])
        }
        className="min-w-0 flex-1"
      />
      <Button
        variant="outlined"
        size="lg"
        shape="rounded"
        loading={busy === "send"}
        disabled={opts.disabled}
        onClick={sendCode}
        className={`${OTP_BUTTON} ${form.otpSent ? "w-[146px]" : "w-[126px]"}`}
      >
        {form.otpSent ? "Resend OTP" : "Send OTP"}
      </Button>
    </div>
  );

  const otpRow = (
    <>
      <div className="flex items-start gap-3">
        <Input
          id={`${ids}-otp`}
          label="OTP Code"
          required
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={`Enter ${OTP_LENGTH}-digit code`}
          value={form.otp}
          error={errors.otp}
          trailing={form.otpVerified ? <Icon name="check-circle-micro" className="text-success-600" /> : undefined}
          onChange={(event) => patch({ otp: event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH), otpVerified: false, verifyFailed: false }, ["otp"])}
          className="min-w-0 flex-1"
        />
        <Button
          variant="outlined"
          size="lg"
          shape="rounded"
          loading={busy === "verify-otp"}
          onClick={confirmOtp}
          className={`${OTP_BUTTON} w-[132px]`}
        >
          Verify OTP
        </Button>
      </div>
      <p className="font-heading text-typo-sm text-pneutral-700">
        We sent a {OTP_LENGTH}-digit code to {formatMobile(mobileDigits(form.mobile))}. It expires in 5 minutes.
      </p>
    </>
  );

  const dobField = (required: boolean) => (
    <Input
      id={`${ids}-dob`}
      label="Patient Date of Birth"
      required={required}
      inputMode="numeric"
      autoComplete="off"
      placeholder="DD/MM/YYYY"
      value={form.dob}
      error={errors.dob}
      trailing={<Icon name="calendar-field" />}
      onChange={(event) => patch({ dob: formatDobInput(event.target.value) }, ["dob"])}
    />
  );

  const existing = form.registration === "existing";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Find a Doctor", href: "/find-doctor" },
          { label: "Patient Details" },
        ]}
      />
      <BookingHeader step={3} title={TITLE} description="Verify the patient if they're already registered, or add their details.">
        <AppointmentSummaryMobile doctor={doctor} draft={draft} onEdit={edit} />
      </BookingHeader>

      <BookingLayout
        rail={
          <>
            <AppointmentSummaryCard doctor={doctor} draft={draft} onEdit={edit} />
            <BookingHelpCard />
          </>
        }
      >
        <form noValidate onSubmit={onSubmit} aria-labelledby={`${ids}-question`} className={bookingCard({ gap: 6, mobileBottom: 6 })}>
          <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="sr-only outline-none">
            {status}
          </p>

          <div className="flex flex-col gap-3">
            <ChoiceHeading id={`${ids}-question`}>Is the patient already registered with this hospital organization?</ChoiceHeading>
            <div role="radiogroup" aria-labelledby={`${ids}-question`} aria-required="true" className="flex flex-col gap-3">
              <ChoiceCard
                id={`${ids}-existing`}
                name="registration"
                value="existing"
                checked={existing}
                onChange={() => chooseRegistration("existing")}
                title="Existing Patient"
                description="The patient has a UHID from a TiaMeds hospital"
              />
              <ChoiceCard
                name="registration"
                value="new"
                checked={form.registration === "new"}
                onChange={() => chooseRegistration("new")}
                title="New Patient"
                description="First visit to a TiaMeds hospital"
              />
            </div>
            {errors.registration && (
              <p role="alert" className="flex items-center gap-2 font-paragraph text-typo-md text-warning-600">
                <Icon name="exclamation-circle-outline" />
                {errors.registration}
              </p>
            )}
          </div>

          {existing && (
            <section aria-labelledby={`${ids}-verify`} className="flex flex-col gap-4">
              <FieldHeading
                id={`${ids}-verify`}
                title="Verify Existing Patient"
                help="We only show the patient's details after we've verified them."
              />
              {verified ? (
                <>
                  <div className="flex flex-col gap-3 rounded-sm bg-success-50 p-4">
                    <p className="flex items-center gap-2 font-heading text-typo-lg font-semibold text-pneutral-900">
                      <Icon name="check-circle-sm" />
                      Verified Patient
                    </p>
                    <dl className="font-heading text-typo-md font-medium">
                      {(
                        [
                          ["Patient Name", verified.name],
                          ["UHID", verified.uhid ?? ""],
                          ["Age", ageLabel(verified.age)],
                          ["Gender", verified.gender],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="flex items-start gap-4 py-2">
                          <dt className="w-[120px] shrink-0 text-pneutral-700">{label}</dt>
                          <dd className="min-w-0 flex-1 text-right text-pneutral-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <Button variant="text" size="sm" shape="pill" onClick={changePatient} className="w-[246px]">
                    Not this patient? Change details
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Input
                      id={`${ids}-uhid`}
                      label="UHID"
                      required
                      autoComplete="off"
                      autoCapitalize="characters"
                      placeholder="e.g. APL000123"
                      value={form.uhid}
                      error={errors.uhid}
                      onChange={(event) => patch({ uhid: event.target.value.toUpperCase().replace(/\s/g, ""), verifyFailed: false }, ["uhid"])}
                    />
                    <Button
                      variant="text"
                      size="sm"
                      shape="pill"
                      onClick={() => {
                        setStatus("Your UHID is on your TiaMeds registration card and on previous bills. Call the helpline if you can't find it.");
                        statusRef.current?.focus();
                      }}
                      className="w-[150px]"
                    >
                      Don&apos;t Know UHID?
                    </Button>
                  </div>
                  {dobField(false)}
                  {mobileRow({ disabled: false })}
                  {form.otpSent && otpRow}
                  {form.verifyFailed ? (
                    <>
                      <p role="alert" className="flex items-start gap-2 rounded-xsm bg-warning-50 px-4 py-3 font-heading text-typo-sm text-warning-600">
                        <Icon name="alert-sm" className="mt-px" />
                        <span className="min-w-0 flex-1">
                          We couldn&apos;t verify these details. Check the UHID, date of birth and mobile number, or call
                          +91 98123 12489 for help.
                        </span>
                      </p>
                      <Button variant="text" size="sm" shape="pill" onClick={() => patch({ verifyFailed: false, otp: "", otpVerified: false })} className="w-[108px]">
                        Try again
                      </Button>
                    </>
                  ) : (
                    form.otpSent && (
                      <Button size="lg" shape="pill" fullWidth loading={busy === "verify-patient"} onClick={verifyPatient}>
                        Verify Patient
                      </Button>
                    )
                  )}
                </>
              )}
            </section>
          )}

          {form.registration === "new" && (
            <>
              <section aria-labelledby={`${ids}-new`} className="flex flex-col gap-4">
                <FieldHeading
                  id={`${ids}-new`}
                  title="Enter New Patient Details"
                  help="A Temporary Patient Registration ID is created only when the appointment is booked."
                />
                <Input
                  id={`${ids}-name`}
                  label="Patient Full Name"
                  required
                  autoComplete="off"
                  value={form.fullName}
                  error={errors.fullName}
                  onChange={(event) => patch({ fullName: event.target.value }, ["fullName"])}
                />
                {dobField(true)}
                <Input
                  label="Age"
                  readOnly
                  tabIndex={-1}
                  value={age === null ? "" : ageLabel(age)}
                  placeholder="Calculated from the date of birth"
                />
                <Select
                  id={`${ids}-gender`}
                  size="lg"
                  label="Gender"
                  required
                  placeholder="Select gender"
                  value={form.gender}
                  error={errors.gender}
                  onChange={(value) => patch({ gender: value }, ["gender"])}
                  options={GENDERS.map((value) => ({ value, label: value }))}
                />
                <Input
                  id={`${ids}-guardian`}
                  label="Guardian Name"
                  autoComplete="off"
                  placeholder="Required if the patient is under 18"
                  value={form.guardian}
                  error={errors.guardian}
                  onChange={(event) => patch({ guardian: event.target.value }, ["guardian"])}
                />
              </section>

              <section aria-labelledby={`${ids}-contact`} className="flex flex-col gap-4">
                <FieldHeading id={`${ids}-contact`} title="Booking Contact" help="We'll send booking updates to this contact." />
                <Input
                  id={`${ids}-contact-name`}
                  label="Booking Contact Name"
                  required
                  autoComplete="name"
                  value={form.contactName}
                  error={errors.contactName}
                  onChange={(event) => patch({ contactName: event.target.value }, ["contactName"])}
                />
                {mobileRow({ disabled: false })}
                {form.otpSent && !form.otpVerified && otpRow}
                <Input
                  id={`${ids}-email`}
                  label="Booking Contact Email"
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(event) => patch({ email: event.target.value }, ["email"])}
                />
                <Input label="Relationship to Patient" readOnly tabIndex={-1} value={relationship} />
              </section>
            </>
          )}

          <FormActions onBack={back} />
        </form>
      </BookingLayout>
    </>
  );
}
