"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny sessionStorage-backed store for mock flow state (the booking in progress, the appointment
 * being managed). Components read it with `useStore()`; any tab-local write notifies subscribers.
 * Reads are cached by raw string so `useSyncExternalStore` always sees a stable snapshot.
 * `serverValue` is what the server and the first client render see (before storage is read).
 */
export function createSessionStore<T>(key: string, serverValue: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = serverValue;

  const readRaw = (): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const read = (): T => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? serverValue : (JSON.parse(raw) as T);
      } catch {
        cachedValue = serverValue;
      }
    }
    return cachedValue;
  };

  const emit = () => listeners.forEach((listener) => listener());

  const write = (value: T) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode) — the state simply doesn't persist across reloads
      cachedRaw = undefined;
      cachedValue = value;
    }
    emit();
  };

  const clear = () => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    cachedRaw = undefined;
    cachedValue = serverValue;
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    read,
    write,
    update: (patch: Partial<T>) => write({ ...read(), ...patch }),
    clear,
    useStore: () => useSyncExternalStore(subscribe, read, () => serverValue),
  };
}
