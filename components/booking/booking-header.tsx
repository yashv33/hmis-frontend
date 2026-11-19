"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/** 1200px page column with the 16px mobile / 24px tablet gutters used across the site. */
export const PAGE_COLUMN = "mx-auto w-full max-w-page px-4 lg:px-6 xl:px-0";

export const BOOKING_STEP_LABELS = [
  "Choose doctor",
  "Appointment details",
  "Patient details",
  "Review and pay",
] as const;

/** The manage-appointment flows (G-02 / G-03) use their own four steps. */
export const MANAGE_STEP_LABELS = [
  "Find appointment",
  "Verify mobile",
  "Manage appointment",
  "Review and confirm",
] as const;

type StepLabels = readonly [string, string, string, string];

/** 1-based step of the four-step stepper. */
export type BookingStepNumber = 1 | 2 | 3 | 4;

/**
 * Figma "Booking Steps" (107:6732): done steps show a check in a primary-800 circle, the current
 * step its number in a primary-800 circle with a 14px label, later steps a white circle with a
 * neutral-300 ring. 32px connectors, 12px apart.
 */
function BookingStepper({ current, labels }: { current: BookingStepNumber; labels: StepLabels }) {
  return (
    <ol aria-label="Progress" className="hidden items-center gap-3 lg:flex">
      {labels.map((label, index) => {
        const number = index + 1;
        const state = number < current ? "done" : number === current ? "current" : "todo";
        return (
          <li
            key={label}
            aria-current={state === "current" ? "step" : undefined}
            className="flex items-center gap-3"
          >
            {index > 0 && <span aria-hidden="true" className="h-px w-8 bg-pneutral-300" />}
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full font-heading text-typo-sm font-semibold",
                  state === "todo"
                    ? "border border-pneutral-300 bg-white text-pneutral-700"
                    : "bg-primary-800 text-white",
                )}
              >
                {state === "done" ? <Icon name="step-check" /> : number}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap font-heading font-medium",
                  state === "current" ? "text-typo-md text-pneutral-900" : "text-typo-sm",
                  state === "done" && "text-pneutral-900",
                  state === "todo" && "text-pneutral-700",
                )}
              >
                {label}
                {state === "done" && <span className="sr-only"> (completed)</span>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The page's `<h1>`, focused when a step opens so keyboard and screen-reader users start at the top
 * of each new step (the title changes between steps; the effect runs again with it).
 */
export function PageTitle({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [children]);
  return (
    <h1
      ref={ref}
      tabIndex={-1}
      className={cn("w-full font-heading text-h4 font-semibold text-pneutral-900 outline-none lg:w-auto lg:text-h2", className)}
    >
      {children}
    </h1>
  );
}

type BookingHeaderProps = {
  /** Step names (default: the booking steps). */
  labels?: StepLabels;
  step: BookingStepNumber;
  title: string;
  /** Desktop only (the mobile frames drop it). */
  description?: ReactNode;
  /** Mobile only: content under the title inside the lavender band (the doctor card). */
  children?: ReactNode;
};

/**
 * "Page Header" of the booking steps (Figma 107:6730 desktop / 109:7895 mobile). Desktop: stepper,
 * 36px title and description. Mobile: "STEP 2 OF 4 · Appointment details", a progress bar, the 28px
 * title and whatever the step puts under it. The title is focused when a step opens, so screen
 * reader and keyboard users start at the top of each new step.
 */
export function BookingHeader({ step, title, description, children, labels = BOOKING_STEP_LABELS }: BookingHeaderProps) {
  return (
    <div className="bg-secondary-50">
      <div className={cn(PAGE_COLUMN, "flex flex-col items-start gap-3 pb-6 pt-4 lg:gap-4 lg:pb-8 lg:pt-6")}>
        <BookingStepper current={step} labels={labels} />

        {/* Mobile progress (Figma "Step Progress Label" + "Progress Track"). */}
        <p className="flex items-center gap-2 font-heading text-typo-sm lg:hidden">
          <span className="font-semibold text-secondary-700">
            STEP {step} OF {labels.length}
          </span>
          <span className="text-pneutral-700">{labels[step - 1]}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Booking progress"
          aria-valuemin={1}
          aria-valuemax={labels.length}
          aria-valuenow={step}
          aria-valuetext={`Step ${step} of ${labels.length}: ${labels[step - 1]}`}
          className="relative h-1 w-full overflow-hidden rounded-full bg-pneutral-200 lg:hidden"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-primary-800"
            style={{ width: `${(step / labels.length) * 100}%` }}
          />
        </div>

        <PageTitle>{title}</PageTitle>
        {description && (
          <p className="hidden font-paragraph text-typo-lg text-pneutral-700 lg:block">{description}</p>
        )}
        {children && <div className="w-full lg:hidden">{children}</div>}
      </div>
    </div>
  );
}
