"use client";

import { useRouter } from "next/navigation";
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { placeholderLogin } from "@/lib/login/placeholder-login";
import type {
  LoginErrors,
  LoginField,
  LoginSubmitHandler,
  LoginValues,
} from "@/lib/login/types";
import { validateField, validateLogin } from "@/lib/login/validation";
import { signIn, signOut } from "@/lib/session/auth";

type LoginFormProps = {
  /** Defaults to the placeholder handler (no backend yet). */
  onSubmit?: LoginSubmitHandler;
  onContinueAsGuest?: () => void;
};

const GENERIC_ERROR = "Something went wrong. Please try again";

/**
 * "Login Card" — Figma 240:1605 (desktop) / 240:1917 (mobile).
 * The error banner and red field borders are the "Incorrect Details" frames.
 */
export function LoginForm({ onSubmit = placeholderLogin, onContinueAsGuest }: LoginFormProps) {
  const router = useRouter();
  const headingId = useId();
  const [values, setValues] = useState<LoginValues>({
    identifier: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({
    identifier: false,
    password: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function setErrorFor(field: LoginField, message: string | undefined) {
    setErrors((current) => ({ ...current, [field]: message }));
  }

  function handleChange(field: LoginField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      setTouched((current) => ({ ...current, [field]: true }));
      setFormError(null);
      // Once a field shows an error, re-check as the user types so it clears when fixed.
      if (errors[field]) setErrorFor(field, validateField(field, next));
    };
  }

  function handleBlur(field: LoginField) {
    return (event: FocusEvent<HTMLInputElement>) => {
      // Only validate on blur when focus moves straight to another text field
      // (Tab or click). If it moves to a button, link or checkbox the user is
      // mid-click: an error line appearing now would shift the control away
      // between mouse-down and mouse-up and the click would be lost. Submit
      // validates everything anyway. `null` covers Safari, which doesn't focus
      // buttons on click.
      const next = event.relatedTarget;
      const movingToTextField =
        next instanceof HTMLInputElement &&
        next.type !== "checkbox" &&
        next.form === event.currentTarget.form;
      if (touched[field] && movingToTextField) {
        setErrorFor(field, validateField(field, values));
      }
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setTouched({ identifier: true, password: true });
    setFormError(null);

    if (nextErrors.identifier) return identifierRef.current?.focus();
    if (nextErrors.password) return passwordRef.current?.focus();

    setSubmitting(true);
    try {
      const result = await onSubmit({
        ...values,
        identifier: values.identifier.trim(),
      });
      if (!result.ok) {
        setFormError(result.message);
        identifierRef.current?.focus();
      } else {
        // Mock session: the public pages swap their guest header for the account header.
        signIn();
        router.push("/find-doctor");
      }
    } catch {
      setFormError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  const credentialsRejected = formError !== null;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={headingId}
      aria-busy={submitting}
      className="flex w-full max-w-[480px] flex-col gap-6 rounded-lg border border-pneutral-200 bg-white px-4 py-6 shadow-soft lg:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2
          id={headingId}
          className="font-heading text-h4 font-semibold text-pneutral-900 lg:text-h2"
        >
          Log in
        </h2>
        <p className="font-paragraph text-typo-md text-pneutral-700">
          Use your registered mobile number or email and your password.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-sm bg-warning-50 px-4 py-3"
        >
          <Icon name="exclamation-triangle-solid" />
          <p className="min-w-0 flex-1 font-paragraph text-typo-md text-warning-600">
            {formError}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Input
          ref={identifierRef}
          name="identifier"
          label="Mobile Number / Email"
          icon="user-outline"
          placeholder="Enter mobile number or email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          readOnly={submitting}
          value={values.identifier}
          onChange={handleChange("identifier")}
          onBlur={handleBlur("identifier")}
          error={errors.identifier}
          invalid={credentialsRejected}
        />
        <PasswordInput
          ref={passwordRef}
          name="password"
          label="Password"
          placeholder="Enter password"
          icon="lock-closed-outline"
          autoComplete="current-password"
          required
          readOnly={submitting}
          value={values.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={errors.password}
          invalid={credentialsRejected}
        />
      </div>

      <div className="flex items-center justify-between">
        <Checkbox
          name="remember"
          label="Remember me"
          checked={values.remember}
          onChange={(event) =>
            setValues((current) => ({ ...current, remember: event.target.checked }))
          }
        />
        <Button
          href="/forgot-password"
          variant="text"
          size="sm"
          shape="responsive"
          className="w-[146px]"
        >
          Forgot Password?
        </Button>
      </div>

      <Button
        type="submit"
        size="lg"
        shape="responsive"
        fullWidth
        loading={submitting}
      >
        Login
      </Button>

      <div className="flex items-center gap-3" role="separator" aria-label="or">
        <span aria-hidden="true" className="h-px flex-1 bg-pneutral-200" />
        <span
          aria-hidden="true"
          className="font-paragraph text-typo-md text-pneutral-700"
        >
          or
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-pneutral-200" />
      </div>

      <Button
        variant="outlined"
        size="lg"
        shape="responsive"
        fullWidth
        disabled={submitting}
        onClick={
          onContinueAsGuest ??
          (() => {
            signOut();
            router.push("/find-doctor");
          })
        }
      >
        Continue as Guest
      </Button>

      <p className="flex items-start justify-center gap-2 font-heading text-typo-md font-medium text-pneutral-700 lg:items-center">
        <Icon name="shield-check-outline" />
        <span className="flex-1 lg:flex-none">
          Your details are protected and never shared.
        </span>
      </p>
    </form>
  );
}
