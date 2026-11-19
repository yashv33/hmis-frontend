/**
 * Calendar helpers for the booking flow. Dates travel as ISO strings ("2026-11-05", local time)
 * and times as 24h "HH:MM"; everything shown on screen is formatted here.
 *
 * The mock world's clock: every design in the booking and manage flows is drawn on
 * Tuesday 3 November 2026 in the morning ("Today, 10:30 AM" is Dr. Rajesh Kumar's first free
 * slot), so "now" is pinned there and the Find a Doctor "Next available" texts stay true.
 * Return `new Date()` from `now()` to run the mocks against the real date instead.
 */
const DEMO_NOW = new Date(2026, 10, 3, 9, 0, 0);

export const now = () => new Date(DEMO_NOW.getTime());

const pad = (n: number) => String(n).padStart(2, "0");

export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAYS_MIN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const isISODate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addMonths = (d: Date, months: number) =>
  new Date(d.getFullYear(), d.getMonth() + months, 1);
export const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const todayISO = () => toISODate(now());

/** "05/11/2026" */
export function formatDate(iso: string) {
  const d = parseISODate(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "Thursday, 05/11/2026" */
export const formatWeekdayDate = (iso: string) =>
  `${WEEKDAYS_LONG[parseISODate(iso).getDay()]}, ${formatDate(iso)}`;

/** "Thursday, 5 November 2026" — the unambiguous form for screen readers. */
export function formatSpokenDate(iso: string) {
  const d = parseISODate(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "November 2026" */
export const formatMonthYear = (d: Date) => `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;

export const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** "14:30" → "02:30 PM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

/** "02:30 PM" → "14:30" */
export function parseTime12(label: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!match) return null;
  const h = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${pad(h)}:${match[2]}`;
}
