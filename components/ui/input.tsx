import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  label: string;
  /** Leading icon (from public/icons). */
  icon?: IconName;
  /** Inline error message. Also switches the field to its error state. */
  error?: string;
  /** Error styling without a message (e.g. the "Incorrect details" banner case). */
  invalid?: boolean;
  /** Control rendered at the end of the field (e.g. show/hide password, ✓ icon). */
  trailing?: ReactNode;
  /** 48px field (dialog forms) instead of the 52px login field. */
  compact?: boolean;
};

/**
 * Text field — Figma ".Input-Size" (label row + ".Textfield" + "Input error message").
 * States: default · hover · focus (focus-within) · error · disabled.
 * Figma draws default, typing (secondary-300 border) and error; hover and the
 * focus ring (needed for keyboard users — secondary-300 alone is 1.9:1 on white)
 * are derived from tokens.
 */
export function Input({
  id,
  label,
  icon,
  error,
  invalid = false,
  trailing,
  compact = false,
  required,
  className,
  ...inputProps
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hasError = invalid || Boolean(error);
  const describedBy =
    [error ? errorId : undefined, inputProps["aria-describedby"]]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label
        htmlFor={inputId}
        className="flex items-center gap-1 px-1 font-heading text-typo-lg font-medium text-pneutral-900"
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            className="font-paragraph text-typo-md font-semibold text-warning-500"
          >
            *
          </span>
        )}
      </label>

      <div
        className={cn(
          "flex items-center gap-3 rounded-xsm border bg-white transition-[border-color,box-shadow] duration-150",
          // Figma draws the stroke inside the 48px box, CSS adds it on top → 1px less padding.
          compact ? "min-h-12 px-[11px]" : "min-h-[52px] px-4",
          hasError
            ? "border-warning-500 focus-within:shadow-[0_0_0_1px_var(--color-warning-500),0_0_0_4px_var(--color-warning-50)]"
            : "border-pneutral-300 hover:border-pneutral-500 focus-within:border-secondary-300 focus-within:shadow-[0_0_0_2px_var(--color-secondary-700)] focus-within:hover:border-secondary-300",
          "has-[input:disabled]:border-pneutral-200 has-[input:disabled]:bg-pneutral-50 has-[input:disabled]:hover:border-pneutral-200",
          // Read-only values (Age, Relationship to Patient) are drawn as a grey, inert field.
          "has-[input:read-only]:border-pneutral-200 has-[input:read-only]:bg-pneutral-50 has-[input:read-only]:shadow-none has-[input:read-only]:hover:border-pneutral-200 has-[input:read-only]:focus-within:border-pneutral-200 has-[input:read-only]:focus-within:shadow-none",
        )}
      >
        {icon && <Icon name={icon} />}
        <input
          {...inputProps}
          id={inputId}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-w-0 flex-1 self-stretch bg-transparent font-paragraph text-typo-lg text-pneutral-900 outline-none placeholder:text-pneutral-500 disabled:cursor-not-allowed disabled:text-pneutral-500 read-only:cursor-default read-only:text-pneutral-700",
            compact ? "py-[11px]" : "py-3",
          )}
        />
        {trailing}
      </div>

      {/* Always rendered so assistive tech announces the message when it appears. */}
      <div aria-live="polite">
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1 px-1 font-heading text-typo-md text-warning-500"
          >
            <span>{error}</span>
            <Icon name="exclamation-circle-outline" />
          </p>
        )}
      </div>
    </div>
  );
}
