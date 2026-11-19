import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type TextareaProps = ComponentProps<"textarea"> & {
  label: string;
  error?: string;
};

/**
 * Multi-line text field — Figma "Other Reason" (G-03.04): the labelled field's border, radius and
 * 16px text, 4 lines tall, with a red asterisk when required.
 */
export function Textarea({ id, label, error, required, className, ...props }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label htmlFor={fieldId} className="flex items-center gap-1 px-1 font-heading text-typo-xl font-medium text-pneutral-800">
        {label}
        {required && (
          <span aria-hidden="true" className="font-paragraph text-typo-md font-semibold text-warning-500">
            *
          </span>
        )}
      </label>
      <textarea
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        rows={props.rows ?? 4}
        className={cn(
          "min-h-[144px] w-full resize-y rounded-xsm border bg-white px-4 py-3 font-paragraph text-typo-xl text-pneutral-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-pneutral-500",
          error
            ? "border-warning-500 focus:shadow-[0_0_0_1px_var(--color-warning-500),0_0_0_4px_var(--color-warning-50)]"
            : "border-pneutral-300 hover:border-pneutral-500 focus:border-secondary-300 focus:shadow-[0_0_0_2px_var(--color-secondary-700)]",
        )}
      />
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="flex items-center gap-1 px-1 font-heading text-typo-md text-warning-500">
            <span>{error}</span>
            <Icon name="exclamation-circle-outline" />
          </p>
        )}
      </div>
    </div>
  );
}
