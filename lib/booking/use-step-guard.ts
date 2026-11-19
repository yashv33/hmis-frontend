"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { bookingDoctor, canOpenStep, resumeHref, useBooking, type BookingRoute } from "./store";

/**
 * Guards a booking step. Opening one directly (a bookmark, a new tab, the back button after
 * confirming) sends the visitor to the first step whose data is still missing, or to Find a Doctor
 * when no booking was started. Returns `null` until the step may render — including the render
 * before the session's booking has been read — so the page shows its skeleton, never stale data.
 */
export function useStepGuard(step: BookingRoute) {
  const router = useRouter();
  const hydrated = useHydrated();
  const draft = useBooking();
  const allowed = hydrated && canOpenStep(step, draft);

  useEffect(() => {
    if (hydrated && !allowed) router.replace(resumeHref(draft));
  }, [hydrated, allowed, draft, router]);

  const doctor = allowed ? bookingDoctor(draft) : undefined;
  return doctor ? { doctor, draft } : null;
}
