import type { LoginErrors, LoginField, LoginValues } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Indian mobile numbers: 10 digits starting 6–9.
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/** Strips spaces/dashes and an optional +91 / 91 / 0 prefix: "+91 98765 43210" → "9876543210". */
export function normalizeMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** "9876543210" → "+91 98765 43210" (the format used throughout the designs). */
export function formatMobile(tenDigits: string): string {
  return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
}

/** Mobile-number-only check (the forgot-password flow has no email option). */
export function validateMobileNumber(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Enter your registered mobile number";
  if (!/^[\d\s\-+()]+$/.test(value) || !MOBILE_PATTERN.test(normalizeMobile(value))) {
    return "Enter a valid 10-digit mobile number";
  }
  return undefined;
}

export function validateIdentifier(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Enter your mobile number or email";

  if (value.includes("@")) {
    return EMAIL_PATTERN.test(value) ? undefined : "Enter a valid email address";
  }

  // Only digits and common separators are allowed in a mobile number.
  if (!/^[\d\s\-+()]+$/.test(value)) {
    return "Enter a valid mobile number or email address";
  }
  return MOBILE_PATTERN.test(normalizeMobile(value))
    ? undefined
    : "Enter a valid 10-digit mobile number";
}

export function validatePassword(value: string): string | undefined {
  return value ? undefined : "Enter your password";
}

export function validateField(
  field: LoginField,
  values: Pick<LoginValues, LoginField>,
): string | undefined {
  return field === "identifier"
    ? validateIdentifier(values.identifier)
    : validatePassword(values.password);
}

export function validateLogin(values: Pick<LoginValues, LoginField>): LoginErrors {
  const errors: LoginErrors = {};
  const identifier = validateIdentifier(values.identifier);
  const password = validatePassword(values.password);
  if (identifier) errors.identifier = identifier;
  if (password) errors.password = password;
  return errors;
}
