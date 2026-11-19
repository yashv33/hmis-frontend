"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";
import { normalizeMobile, validateMobileNumber } from "@/lib/login/validation";
import { manageStore, normalizeReference, REFERENCE_PATTERN } from "@/lib/manage/store";
import { signOut } from "@/lib/session/auth";
import { clearBooking, useBookingInProgress } from "@/lib/session/booking-draft";
import { Dialog, DialogHeader } from "./dialog";

/** Which overlay is open. The shell provider holds one of these (or null). */
export type DialogState =
  | { kind: "logout" }
  | { kind: "login" }
  | { kind: "helpline" }
  | { kind: "assistance"; doctor: Doctor }
  | { kind: "manage" };

export const HELPLINE_NUMBER = "+91 98123 12489";
export const HELPLINE_TEL = "tel:+919812312489";
export const WHATSAPP_URL = "https://wa.me/919812312489";

type ContentProps = { onClose: () => void; open: (dialog: DialogState) => void };

/* -------------------------------------------------------------------------------------------- */
/* Log out? — Figma 246:1562 / 246:1626 (desktop) · 246:1675 / 246:1725 (mobile)                  */
/* -------------------------------------------------------------------------------------------- */

const LOGOUT_COPY = {
  default: "You'll need to log in again to see your appointments, profile and family members.",
  booking:
    "Your appointment booking isn't finished. If you log out now, your selected doctor, date and time slot won't be kept.",
};

function LogoutContent({ onClose }: ContentProps) {
  const titleId = useId();
  const descriptionId = useId();
  const bookingInProgress = useBookingInProgress();
  return (
    <Dialog onClose={onClose} labelledBy={titleId} describedBy={descriptionId}>
      <DialogHeader icon="logout-md" title="Log out?" titleId={titleId} onClose={onClose} />
      <p id={descriptionId} className="w-full font-paragraph text-typo-md text-pneutral-700">
        {bookingInProgress ? LOGOUT_COPY.booking : LOGOUT_COPY.default}
      </p>
      <div className="flex w-full flex-col gap-3 lg:flex-row">
        <Button
          variant="outlined"
          tone="secondary"
          shape="pill"
          data-autofocus
          onClick={onClose}
          className="w-full lg:w-auto lg:flex-1"
        >
          Stay Logged In
        </Button>
        <Button
          href="/login"
          shape="pill"
          onClick={() => {
            signOut();
            clearBooking();
            onClose();
          }}
          className="w-full lg:w-auto lg:flex-1"
        >
          Confirm Logout
        </Button>
      </div>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Log in — Figma 184:74697 (desktop) · 184:74750 (mobile)                                        */
/* -------------------------------------------------------------------------------------------- */

function LoginContent({ onClose, open }: ContentProps) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Dialog onClose={onClose} labelledBy={titleId} describedBy={descriptionId}>
      <DialogHeader icon="login-md" title="Log in" titleId={titleId} onClose={onClose} />
      <p id={descriptionId} className="w-full font-paragraph text-typo-md text-pneutral-700">
        Patient login is coming soon. You can book and manage appointments as a guest, no account
        needed.
      </p>
      <div className="flex w-full flex-col gap-3 lg:flex-row">
        <Button
          href="/find-doctor"
          shape="pill"
          data-autofocus
          onClick={onClose}
          className="w-full lg:w-auto lg:flex-1"
        >
          Book Appointment
        </Button>
        <Button
          variant="outlined"
          tone="secondary"
          shape="pill"
          onClick={() => open({ kind: "manage" })}
          className="w-full lg:w-auto lg:flex-1"
        >
          Manage Appointment
        </Button>
      </div>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Call for assistance — Helpline 184:74800 / 184:74824 · doctor-specific 127:23682 / 127:23743   */
/* -------------------------------------------------------------------------------------------- */

function AssistanceContent({ onClose, doctor }: ContentProps & { doctor?: Doctor }) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Dialog onClose={onClose} labelledBy={titleId} describedBy={descriptionId}>
      <DialogHeader icon="phone-lg" title="Call for assistance" titleId={titleId} onClose={onClose} />
      <p id={descriptionId} className="w-full font-paragraph text-typo-md text-pneutral-700">
        {doctor
          ? `${doctor.name} isn't available for online booking. Our care team can check availability and book the appointment for you.`
          : "Our care team can help you find a doctor, book, reschedule or cancel an appointment."}
      </p>
      <div className="flex w-full flex-col gap-1 rounded-lg bg-secondary-50 p-4 font-heading">
        <p className="text-typo-sm text-secondary-700">24×7 HELPLINE</p>
        <p className="text-h4 font-semibold text-pneutral-900">{HELPLINE_NUMBER}</p>
        <p className="text-typo-sm text-pneutral-700">
          {doctor
            ? `Have the doctor's name ready: ${doctor.name}, ${doctor.specialty}, ${hospitalName(doctor.hospital)}.`
            : "International patients: our team can also help you plan your visit."}
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 lg:flex-row">
        <Button
          href={HELPLINE_TEL}
          shape="pill"
          icon="phone-outline-md"
          data-autofocus
          className="w-full lg:w-auto lg:flex-1"
        >
          Call 24×7 Helpline
        </Button>
        <Button
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          tone="secondary"
          shape="pill"
          icon="chat-bubble-left-ellipsis-outline"
          className="w-full lg:w-auto lg:flex-1"
        >
          Chat on WhatsApp
        </Button>
      </div>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Manage your appointment — Figma 94:6573 ("Find Your Appointment", step 2 of G-02 / G-03)       */
/* -------------------------------------------------------------------------------------------- */

function ManageContent({ onClose }: ContentProps) {
  const router = useRouter();
  const titleId = useId();
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<{ reference?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const ref = normalizeReference(reference);
    const next = {
      reference: !ref
        ? "Enter your appointment reference"
        : REFERENCE_PATTERN.test(ref)
          ? undefined
          : "Check the reference, e.g. TMH-260511-0042",
      mobile: validateMobileNumber(mobile),
    };
    setErrors(next);
    if (next.reference || next.mobile) return;

    setSubmitting(true);
    // Mock lookup. Any well-formed pair is found, except references ending in 0000.
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (ref.endsWith("-0000")) {
      setErrors({ reference: "We couldn't find a booking with this reference and number" });
      setSubmitting(false);
      return;
    }
    manageStore.write({ reference: ref, mobile: normalizeMobile(mobile), verified: false });
    onClose();
    router.push("/manage-appointment/verify");
  }

  return (
    <Dialog onClose={onClose} labelledBy={titleId} placement="high">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 id={titleId} className="font-heading text-h4 font-semibold text-pneutral-900">
              Manage your appointment
            </h2>
            <p className="font-paragraph text-typo-lg text-pneutral-700">
              Find your booking to view, reschedule or cancel it.
            </p>
          </div>
          <Button
            variant="text"
            size="md"
            shape="pill"
            iconOnly
            icon="x-mark-outline"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          <Input
            compact
            data-autofocus
            label="Appointment Reference"
            name="reference"
            placeholder="e.g. TMH-260511-0042"
            autoComplete="off"
            value={reference}
            error={errors.reference}
            onChange={(event) => setReference(event.target.value)}
          />
          <Input
            compact
            label="Booking Contact Mobile Number"
            name="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="+91 Mobile number"
            autoComplete="tel-national"
            value={mobile}
            error={errors.mobile}
            onChange={(event) => setMobile(event.target.value)}
          />
          <Button
            type="submit"
            shape="pill"
            fullWidth
            loading={submitting}
            iconRight={<Icon name="arrow-right-outline" />}
          >
            Find Appointment
          </Button>
          <p className="text-center font-heading text-typo-sm text-pneutral-700">
            We&apos;ll send a one-time code to this number to confirm it&apos;s you.
          </p>
        </form>
      </div>
    </Dialog>
  );
}

/** Renders the open overlay. Remounts on a change of kind so focus and scroll locks reset. */
export function DialogHost({
  dialog,
  onClose,
  open,
}: {
  dialog: DialogState | null;
  onClose: () => void;
  open: (dialog: DialogState) => void;
}) {
  if (!dialog) return null;
  const common = { onClose, open };
  switch (dialog.kind) {
    case "logout":
      return <LogoutContent key="logout" {...common} />;
    case "login":
      return <LoginContent key="login" {...common} />;
    case "helpline":
      return <AssistanceContent key="helpline" {...common} />;
    case "assistance":
      return <AssistanceContent key={`assistance-${dialog.doctor.id}`} {...common} doctor={dialog.doctor} />;
    case "manage":
      return <ManageContent key="manage" {...common} />;
  }
}
