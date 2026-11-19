import { useSyncExternalStore } from "react";
import { formatMobile } from "@/lib/login/validation";

/**
 * What the four forgot-password screens pass to each other. Kept in memory and
 * mirrored to sessionStorage so a refresh in the middle of the flow doesn't lose
 * it. (Mock only — with a real backend this would be a server-issued reset token.)
 */
export type FlowState = {
  /** Normalised 10-digit mobile number the OTP was sent to. */
  mobile: string | null;
  otpVerified: boolean;
  resetComplete: boolean;
};

const STORAGE_KEY = "hmis.forgot-password.flow";
const EMPTY: FlowState = { mobile: null, otpVerified: false, resetComplete: false };

/** Figma sample number, shown when a screen is opened directly without going through the flow. */
export const SAMPLE_MOBILE = "9876543210";

let current: FlowState | null = null;
const listeners = new Set<() => void>();

function load(): FlowState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<FlowState>) };
  } catch {
    // sessionStorage can be blocked (private mode) — the in-memory copy still works.
  }
  return EMPTY;
}

function getSnapshot(): FlowState {
  if (current === null) current = load();
  return current;
}

function commit(next: FlowState) {
  current = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore, see above
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateFlow(patch: Partial<FlowState>) {
  commit({ ...getSnapshot(), ...patch });
}

export function resetFlow() {
  commit(EMPTY);
}

export function useFlow(): FlowState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** The number to display, e.g. "+91 98765 43210" (falls back to the Figma sample). */
export function useDisplayMobile(): string {
  const { mobile } = useFlow();
  return formatMobile(mobile ?? SAMPLE_MOBILE);
}
