import type { Doctor } from "@/lib/find-doctor/types";
import { isSlotTaken } from "./booked-slots";
import {
  MONTHS_SHORT,
  WEEKDAYS_SHORT,
  addDays,
  fromMinutes,
  minutesOf,
  now,
  parseISODate,
  parseTime12,
  toISODate,
} from "./dates";

/** Bookings open this many days ahead; later dates show as unavailable. */
export const BOOKING_WINDOW_DAYS = 60;

const MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const AFTERNOON = ["14:00", "14:30", "15:00", "15:30"];

export type TimeSlot = { time: string; available: boolean };
export type SlotGroup = { id: "morning" | "afternoon" | "evening"; label: string; slots: TimeSlot[] };
export type DayAvailability = { date: string; groups: SlotGroup[]; available: number };

/**
 * Booked slots per weekday (Sunday … Saturday) as indexes into the day's ten slots (0–5 morning,
 * 6–9 afternoon). Three variations so doctors don't all look alike. Variation 0 is the week drawn
 * for Dr. Rajesh Kumar in G-01.02: Wed 6, Thu 7 (11:00, 11:30 and 03:00 PM booked), Fri 5,
 * Sat 3 (no afternoon clinic) and Mon 7 free slots. Sundays are closed for everyone.
 */
const BOOKED: number[][][] = [
  [[], [2, 5, 9], [1, 4, 6, 8], [1, 4, 6, 9], [4, 5, 8], [0, 3, 5, 7, 8], [1, 3, 4, 6, 7, 8, 9]],
  [[], [0, 4, 7], [2, 3, 8, 9], [1, 5, 6], [0, 2, 7, 9], [3, 4, 6, 8], [0, 2, 6, 7, 8, 9]],
  [[], [1, 3, 6, 8], [0, 5, 9], [2, 4, 7, 8], [1, 3, 5, 6], [2, 9], [3, 4, 6, 7, 8, 9]],
];

function variationOf(doctor: Doctor) {
  if (doctor.id === "rajesh-kumar") return 0;
  let sum = 0;
  for (const char of doctor.id) sum += char.charCodeAt(0);
  return sum % BOOKED.length;
}

/**
 * The doctor's first free slot, read from the "Next available" text on their Find a Doctor card
 * ("Today, 10:30 AM", "Tomorrow, 09:00 AM", "Sat, 07 Nov, 11:00 AM"). `null` when the doctor
 * isn't bookable online.
 */
export function nextAvailableSlot(doctor: Doctor): { date: string; time: string } | null {
  const label = doctor.nextAvailable?.label;
  if (!label) return null;
  const parts = label.split(", ");
  const time = parseTime12(parts[parts.length - 1]);
  if (!time) return null;
  const today = now();
  let day = today;
  if (parts[0] === "Tomorrow") day = addDays(today, 1);
  else if (parts[0] !== "Today" && parts.length === 3) {
    const [dd, mon] = parts[1].split(" ");
    const month = MONTHS_SHORT.indexOf(mon as (typeof MONTHS_SHORT)[number]);
    day = new Date(today.getFullYear(), month, Number(dd));
    if (toISODate(day) < toISODate(today)) day = new Date(today.getFullYear() + 1, month, Number(dd));
  }
  return { date: toISODate(day), time };
}

/**
 * Second clinic session. 02:00–03:30 PM by default (as drawn); doctors whose first free slot is
 * later in the day (04:30 PM, 07:00 PM…) or at noon keep a four-slot session around it, so the
 * slot from their card is always on the grid.
 */
function laterSession(firstSlot: { time: string } | null) {
  if (!firstSlot) return AFTERNOON;
  const t = minutesOf(firstSlot.time);
  if (t < 12 * 60 || (t >= 14 * 60 && t <= 15 * 60 + 30)) return AFTERNOON;
  if (t < 14 * 60) return [0, 1, 2, 3].map((i) => fromMinutes(t + 30 * i));
  return [3, 2, 1, 0].map((i) => fromMinutes(t - 30 * i));
}

export const lastBookableDate = () => toISODate(addDays(now(), BOOKING_WINDOW_DAYS));

/** Slots for one day, grouped as the design shows them (MORNING / AFTERNOON). */
export function dayAvailability(doctor: Doctor, iso: string): DayAvailability {
  const first = nextAvailableSlot(doctor);
  const later = laterSession(first);
  const times = [...MORNING, ...later];
  const weekday = parseISODate(iso).getDay();
  const today = toISODate(now());

  let open: boolean[];
  if (!first || weekday === 0 || iso < today || iso < first.date || iso > lastBookableDate()) {
    open = times.map(() => false);
  } else if (iso === first.date) {
    // The day of the first free slot: that slot and the day's last one are left.
    const from = minutesOf(first.time);
    open = times.map(
      (time, index) =>
        time === first.time || (index === times.length - 1 && minutesOf(time) > from),
    );
  } else {
    const booked = BOOKED[variationOf(doctor)][weekday];
    open = times.map((_, index) => !booked.includes(index));
  }

  // Slots booked from this browser are gone for everyone (the doctor's free list shrinks).
  const slots = times.map((time, index) => ({
    time,
    available: open[index] && !isSlotTaken(doctor.id, iso, time),
  }));
  const laterId = minutesOf(later[0]) >= 17 * 60 ? "evening" : "afternoon";
  return {
    date: iso,
    groups: [
      { id: "morning", label: "Morning", slots: slots.slice(0, MORNING.length) },
      { id: laterId, label: laterId === "evening" ? "Evening" : "Afternoon", slots: slots.slice(MORNING.length) },
    ],
    available: slots.filter((slot) => slot.available).length,
  };
}

export const isSlotAvailable = (doctor: Doctor, iso: string, time: string) =>
  dayAvailability(doctor, iso).groups.some((group) =>
    group.slots.some((slot) => slot.time === time && slot.available),
  );

export type DateChipData = {
  date: string;
  /** "Today" or the short weekday ("Wed"). */
  day: string;
  dayOfMonth: string;
  month: string;
  available: number;
};

/** The seven-day strip under "Appointment Date", starting at `startISO`. */
export function dateStrip(doctor: Doctor, startISO: string, days = 7): DateChipData[] {
  const today = toISODate(now());
  const start = parseISODate(startISO);
  return Array.from({ length: days }, (_, offset) => {
    const d = addDays(start, offset);
    const iso = toISODate(d);
    return {
      date: iso,
      day: iso === today ? "Today" : WEEKDAYS_SHORT[d.getDay()],
      dayOfMonth: String(d.getDate()).padStart(2, "0"),
      month: MONTHS_SHORT[d.getMonth()],
      available: dayAvailability(doctor, iso).available,
    };
  });
}

/** "7 slots" · "1 slot" · "No slots" */
export const slotCountLabel = (count: number) =>
  count === 0 ? "No slots" : `${count} ${count === 1 ? "slot" : "slots"}`;
