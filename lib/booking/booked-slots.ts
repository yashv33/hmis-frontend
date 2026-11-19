"use client";

/**
 * Slots taken by bookings made in this browser (localStorage, so every tab agrees). They show as
 * unavailable on Select Appointment Details, and booking one that was taken in the meantime fails
 * with the design's "We couldn't book this appointment".
 */
const KEY = "tiameds.booked-slots";

const slotKey = (doctorId: string, date: string, time: string) => `${doctorId}|${date}|${time}`;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export const isSlotTaken = (doctorId: string, date: string, time: string) =>
  read().includes(slotKey(doctorId, date, time));

export function takeSlot(doctorId: string, date: string, time: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...read(), slotKey(doctorId, date, time)]));
  } catch {
    // storage unavailable — the slot simply isn't remembered
  }
}

/** Frees a slot (a booking was cancelled or moved). */
export function releaseSlot(doctorId: string, date: string, time: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(read().filter((item) => item !== slotKey(doctorId, date, time))));
  } catch {
    // ignore
  }
}

/** Next number of the mock appointment / registration counters (start at 123 / 45 like the designs). */
export function nextSerial(counter: "appointment" | "registration", start: number) {
  const key = `tiameds.serial.${counter}`;
  let current = start;
  try {
    const stored = Number(window.localStorage.getItem(key));
    if (Number.isFinite(stored) && stored >= start) current = stored + 1;
    window.localStorage.setItem(key, String(current));
  } catch {
    // ignore
  }
  return current;
}
