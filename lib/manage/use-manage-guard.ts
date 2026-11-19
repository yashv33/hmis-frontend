"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppointment } from "@/lib/appointments/store";
import { getDoctor } from "@/lib/find-doctor/doctors";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { manageStore } from "./store";

/**
 * Guards the pages after "Find Your Appointment": they need an appointment found by reference and
 * mobile, and — except the OTP page itself — a verified mobile. Anyone arriving without one is sent
 * to the step they skipped. Returns `null` until the page may render.
 */
export function useManageGuard({ needsVerified = true }: { needsVerified?: boolean } = {}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = manageStore.useStore();
  const appointment = useAppointment(session.reference);
  const matches = Boolean(appointment) && appointment!.mobile === session.mobile;

  useEffect(() => {
    if (!hydrated) return;
    if (!matches) router.replace("/manage-appointment");
    else if (needsVerified && !session.verified) router.replace("/manage-appointment/verify");
  }, [hydrated, matches, needsVerified, session.verified, router]);

  if (!hydrated || !matches || (needsVerified && !session.verified)) return null;
  const doctor = getDoctor(appointment!.doctorId);
  return doctor ? { appointment: appointment!, doctor, session } : null;
}
