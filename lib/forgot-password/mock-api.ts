/**
 * MOCK API — frontend only, there is no backend yet. Replace each function with the
 * real request and keep the result shapes so the screens don't change.
 *
 * Demo rules (so every state in the Figma frames can be reached):
 *  - mobile numbers ending in 0000 are "not registered"  → Account Not Found
 *    (the frame uses +91 98765 40000)
 *  - the OTP is always 123456 (also logged to the console when a code is "sent");
 *    any other 6-digit code → "Incorrect code"
 */
const LATENCY_MS = 900;

export const DEMO_OTP = "123456";

/** The real cooldown; the Figma prototype shortens it to 3s only as a stand-in. */
export const RESEND_COOLDOWN_SECONDS = 30;

const wait = (ms = LATENCY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type RequestOtpResult = { ok: true } | { ok: false; reason: "not-found" };

export async function requestOtp(mobile: string): Promise<RequestOtpResult> {
  await wait();
  if (mobile.endsWith("0000")) return { ok: false, reason: "not-found" };
  console.info(`[forgot-password] mock OTP sent — enter ${DEMO_OTP}`);
  return { ok: true };
}

export async function verifyOtp(mobile: string, code: string): Promise<{ ok: boolean }> {
  await wait();
  void mobile; // a real API verifies the code against this number
  return { ok: code === DEMO_OTP };
}

export async function resetPassword(mobile: string, password: string): Promise<{ ok: true }> {
  await wait();
  void mobile; // a real API would set `password` for this account
  void password;
  return { ok: true };
}
