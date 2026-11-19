"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FlowActions } from "@/components/flow/flow-actions";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SAMPLE_MOBILE, updateFlow, useFlow } from "@/lib/forgot-password/flow-store";
import { resetPassword } from "@/lib/forgot-password/mock-api";
import {
  validateConfirmPassword,
  validateNewPassword,
} from "@/lib/forgot-password/validation";

type Errors = { password?: string; confirm?: string };

/**
 * Screen C — "R-01.01C Reset Password" (+ "Passwords Don't Match").
 * The design shows plain password fields and the rules as text, so there is no
 * show/hide toggle or strength meter here.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const { mobile } = useFlow();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setPassword(next);
    // Re-check as the user types, but only fields that are already showing an error.
    setErrors((current) => ({
      password: current.password ? validateNewPassword(next) : undefined,
      confirm: current.confirm ? validateConfirmPassword(next, confirm) : undefined,
    }));
  }

  function handleConfirmChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setConfirm(next);
    setErrors((current) => ({
      ...current,
      confirm: current.confirm ? validateConfirmPassword(password, next) : undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: Errors = {
      password: validateNewPassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(nextErrors);
    if (nextErrors.password) return passwordRef.current?.focus();
    if (nextErrors.confirm) return confirmRef.current?.focus();

    setSubmitting(true);
    try {
      await resetPassword(mobile ?? SAMPLE_MOBILE, password);
      updateFlow({ resetComplete: true });
      router.push("/forgot-password/success");
    } catch {
      setErrors({ confirm: "Something went wrong. Please try again" });
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        <Input
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="new-password"
          label="New Password"
          required
          readOnly={submitting}
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
        />
        <Input
          ref={confirmRef}
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          label="Confirm New Password"
          required
          readOnly={submitting}
          value={confirm}
          onChange={handleConfirmChange}
          error={errors.confirm}
        />
      </div>

      <Callout tone="info" title="Password rules">
        At least 8 characters, with a letter, a number and a symbol.
      </Callout>

      <FlowActions>
        <Button href="/forgot-password/verify" variant="outlined" shape="responsive">
          Back
        </Button>
        <Button
          type="submit"
          shape="responsive"
          iconRight={<Icon name="arrow-right-outline" />}
          loading={submitting}
          className="flex-1 lg:flex-none"
        >
          Reset Password
        </Button>
      </FlowActions>
    </form>
  );
}
