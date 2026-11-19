"use client";

import { useSyncExternalStore } from "react";

/**
 * Mock "signed in" flag. The public pages (homepage, Find a Doctor, the booking steps) render
 * the guest header — with the Login button — until someone "logs in" on /login; then the same
 * pages render the account header instead. Kept in sessionStorage so it survives a refresh but
 * not a new tab. There is no real authentication behind it.
 */
const KEY = "tiameds.signed-in";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

const emit = () => listeners.forEach((listener) => listener());

export function signIn() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // storage unavailable — the flag simply doesn't persist
  }
  emit();
}

export function signOut() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** `false` on the server and during hydration, so the first paint is always the guest chrome. */
export const useSignedIn = () => useSyncExternalStore(subscribe, read, () => false);
