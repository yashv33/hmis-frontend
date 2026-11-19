import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Figma "Field Heading": a 20/28 semibold title with optional 14/20 help text, 4px apart, and an
 * optional action on the right (the date field's "View calendar").
 */
export function FieldHeading({
  id,
  title,
  help,
  helpId,
  action,
  as: Tag = "h2",
}: {
  id: string;
  title: ReactNode;
  help?: ReactNode;
  helpId?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Tag id={id} className="font-heading text-h6 font-semibold text-pneutral-900">
          {title}
        </Tag>
        {help && (
          <p id={helpId} className="font-paragraph text-typo-md text-pneutral-700">
            {help}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Inline field error (derived: the designs don't draw one for this field). */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-2 font-paragraph text-typo-md text-warning-600">
      <Icon name="exclamation-circle-outline" />
      {children}
    </p>
  );
}

/** Figma "Booking Note": grey box with a clock icon and a 12/18 note. */
export function BookingNote({
  children,
  icon = "clock-sm",
}: {
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <p className="flex items-start gap-2 rounded-xsm bg-pneutral-50 p-3 font-heading text-typo-sm text-pneutral-700 lg:items-center lg:px-4">
      <Icon name={icon} className="shrink-0 lg:mt-0" />
      <span className="min-w-0 flex-1">{children}</span>
    </p>
  );
}

type FormActionsProps = {
  onBack: () => void;
  backLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
  /** The form the Continue button submits (when it lives outside it, as the mobile bar does). */
  form?: string;
  loading?: boolean;
  /** Continue stays disabled (lavender in Figma) until the step is complete. */
  continueDisabled?: boolean;
  /** Extra classes for the desktop row. */
  className?: string;
  /**
   * Mobile bar: the booking steps' 73px one ("compact") or the manage flow's 100px one ("roomy",
   * 48px buttons centred). Pages pass the same kind to BookingLayout's `actionBar`.
   */
  bar?: "compact" | "roomy";
  /** Under 640px the two buttons stack (full width) — for labels too long to share one row. */
  stackOnNarrow?: boolean;
};

/**
 * Back / Continue. Desktop (Figma "Form Actions"): at the bottom of the card, under a divider —
 * 108px outlined Back on the left, Continue → on the right, 8px radius. Mobile (Figma "Bottom
 * Action Bar"): pinned to the bottom of the screen with a top border, pill buttons, Continue
 * filling the row. Pages with this bar pass `actionBar` to BookingLayout, which keeps the last
 * content clear of it.
 */
export function FormActions({
  onBack,
  backLabel = "Back",
  continueLabel = "Continue",
  onContinue,
  form,
  loading = false,
  continueDisabled = false,
  className,
  bar = "compact",
  stackOnNarrow = false,
}: FormActionsProps) {
  const continueButton = (extra: string) => (
    <Button
      type={form || !onContinue ? "submit" : "button"}
      form={form}
      onClick={onContinue}
      loading={loading}
      disabled={continueDisabled}
      shape="responsive"
      iconRight={<Icon name="arrow-right-outline" />}
      className={cn(extra, "disabled:bg-secondary-100! disabled:text-secondary-300!")}
    >
      {continueLabel}
    </Button>
  );
  // At least 108px (Figma "Back"); a longer label such as "Keep Appointment" sizes the button.
  const backButton = (extra = "") => (
    <Button variant="outlined" shape="responsive" onClick={onBack} className={extra}>
      {backLabel}
    </Button>
  );
  return (
    <>
      <div
        className={cn(
          "hidden w-full items-center justify-between border-t border-pneutral-200 pt-6 lg:flex",
          className,
        )}
      >
        {backButton()}
        {continueButton("")}
      </div>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-pneutral-200 bg-white px-4 lg:hidden",
          bar === "roomy"
            ? "pt-[25.5px] pb-[calc(25.5px+env(safe-area-inset-bottom))]"
            : "pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          stackOnNarrow &&
            "max-sm:flex-col max-sm:items-stretch max-sm:pt-3 max-sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        )}
      >
        {backButton(stackOnNarrow ? "max-sm:w-full" : "")}
        {continueButton(cn("min-w-0 flex-1", stackOnNarrow && "max-sm:w-full max-sm:flex-none"))}
      </div>
    </>
  );
}
