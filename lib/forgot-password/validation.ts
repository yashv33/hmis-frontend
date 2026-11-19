export const OTP_LENGTH = 6;

export const PASSWORD_RULES_MESSAGE =
  "Use at least 8 characters, with a letter, a number and a symbol.";

/** Design copy: "At least 8 characters, with a letter, a number and a symbol." */
export function passwordMeetsRules(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}

export function validateOtp(code: string): string | undefined {
  return code.length === OTP_LENGTH ? undefined : `Enter the ${OTP_LENGTH}-digit code`;
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Enter a new password";
  return passwordMeetsRules(password) ? undefined : PASSWORD_RULES_MESSAGE;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return "Confirm your new password";
  return confirm === password ? undefined : "Passwords don't match.";
}
