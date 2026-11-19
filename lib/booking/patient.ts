import { now } from "./dates";

/** Mock one-time code accepted by every OTP field in the booking flow (the one drawn in Figma). */
export const MOCK_OTP = "482916";
export const OTP_LENGTH = 6;

/** Registered patient used by the mock "Verify Existing Patient" lookup (the design's sample). */
const REGISTERED = [
  { uhid: "APL000123", dob: "14/08/1984", mobile: "9876543210", name: "Rajesh Kumar", gender: "Male" },
];

export const GENDERS = ["Female", "Male", "Other"] as const;

/** Digits only, at most 10, without a leading 91 / 0 country or trunk prefix. */
export function mobileDigits(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  return digits.slice(0, 10);
}

/** "9876543210" → "+91 98765 43210" (partial input is formatted as far as it goes). */
export function formatMobile(digits: string) {
  if (!digits) return "";
  const head = digits.slice(0, 5);
  const tail = digits.slice(5);
  return `+91 ${head}${tail ? ` ${tail}` : ""}`;
}

export const isValidMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

/** Masks typed digits as DD/MM/YYYY. */
export function formatDobInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean);
  return parts.join("/");
}

/** A real calendar date in the past, as a Date (or null). */
export function parseDob(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (y < 1900 || date > now()) return null;
  return date;
}

export function ageInYears(dob: Date) {
  const today = now();
  let age = today.getFullYear() - dob.getFullYear();
  const birthdayPassed =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!birthdayPassed) age -= 1;
  return Math.max(0, age);
}

export const ageLabel = (age: number) => `${age} ${age === 1 ? "Year" : "Years"}`;

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Mock latency so loading states are visible. */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type ExistingLookup = { uhid: string; dob: string; mobile: string; otp: string };

/**
 * Mock verification of an existing patient. Fails the same way for an unknown UHID, a different
 * date of birth or mobile number, or a wrong code, so the screen can't be used to find out which
 * part was wrong (the design's "safe error").
 */
export async function verifyExistingPatient({ uhid, dob, mobile, otp }: ExistingLookup) {
  await delay(800);
  const patient = REGISTERED.find(
    (p) =>
      p.uhid === uhid.trim().toUpperCase() &&
      (!dob || p.dob === dob) &&
      p.mobile === mobile,
  );
  if (!patient || otp !== MOCK_OTP) return null;
  const birth = parseDob(patient.dob)!;
  return { name: patient.name, uhid: patient.uhid, age: ageInYears(birth), gender: patient.gender };
}

export async function sendOtp(mobile: string) {
  await delay(600);
  return isValidMobile(mobile);
}

export async function checkOtp(code: string) {
  await delay(600);
  return code === MOCK_OTP;
}
