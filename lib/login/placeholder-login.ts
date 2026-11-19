import type { LoginResult, LoginValues } from "./types";
import { normalizeMobile } from "./validation";

const LATENCY_MS = 1200;

/**
 * PLACEHOLDER — there is no backend yet. Replace with the real auth call
 * (e.g. a Server Action or API request) and keep the `LoginResult` contract.
 *
 * Demo hook: submitting the mobile number 98765 43210 (the one in the Figma
 * "Incorrect Details" frame) returns a failure so the error state can be seen.
 */
export async function placeholderLogin(values: LoginValues): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  if (normalizeMobile(values.identifier) === "9876543210") {
    return { ok: false, message: "Incorrect login details. Please try again" };
  }

  console.info("[login] placeholder submit — no backend connected yet", {
    identifierType: values.identifier.includes("@") ? "email" : "mobile",
    remember: values.remember,
  });
  return { ok: true };
}

