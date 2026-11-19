import type { ComponentProps } from "react";
import { Icon } from "./icon";
import { Input } from "./input";

type OtpInputProps = Omit<
  ComponentProps<typeof Input>,
  "label" | "value" | "onChange" | "type" | "icon" | "trailing" | "required"
> & {
  value: string;
  onChange: (digits: string) => void;
  length?: number;
};

/**
 * Figma "OTP Field" — one text field, not separate boxes. States: Empty
 * (placeholder) · Typing (focus) · Complete (all digits → ✓ icon) · Error.
 *
 * Digits only: typing or pasting ("482 915", "482-915") is cleaned and capped at
 * `length`, so there is deliberately no `maxLength` (it would cut a pasted code
 * that contains separators before it can be cleaned).
 */
export function OtpInput({ value, onChange, length = 6, error, ...props }: OtpInputProps) {
  const complete = value.length === length && !error;
  return (
    <Input
      label="OTP Code"
      required
      name="otp"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      placeholder={`Enter ${length}-digit code`}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, length))}
      error={error}
      trailing={
        complete ? <Icon name="check-circle-micro" className="text-success-600" /> : undefined
      }
      {...props}
    />
  );
}
