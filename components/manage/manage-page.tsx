"use client";

import type { ReactNode } from "react";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BookingHeader, MANAGE_STEP_LABELS, type BookingStepNumber } from "@/components/booking/booking-header";
import { BookingLayout, bookingCard } from "@/components/booking/booking-layout";
import { SuccessHeader } from "@/components/booking/success-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import type { Appointment } from "@/lib/appointments/store";

/**
 * Page frame of the manage-appointment flows (Figma G-02 / G-03): "Home › Manage Appointment ›
 * <page>" breadcrumb, the lavender header with the four manage steps (Find appointment, Verify
 * mobile, Manage appointment, Review and confirm), one 792px card and the Booking Help rail.
 */
export function ManagePage({
  step,
  title,
  description,
  crumb,
  actionBar = false,
  children,
  as = "form",
  onSubmit,
  label,
}: {
  step: BookingStepNumber;
  title: string;
  description?: string;
  crumb: string;
  /**
   * The fixed mobile bar the page ends in (Figma "Bottom Action Bar"): `true` for the 100px Back /
   * Continue bar, "stacked" when its buttons stack under 640px, "single" for the 81px bar of a
   * PinnedAction. The card then keeps 32px under its last section, as in the mobile frames.
   */
  actionBar?: boolean | "stacked" | "single";
  children: ReactNode;
  as?: "form" | "div";
  onSubmit?: (event: React.FormEvent) => void;
  label: string;
}) {
  const card = bookingCard({ gap: 6, mobileBottom: actionBar ? 8 : 6 });
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Manage Appointment", href: "/manage-appointment" },
          { label: crumb },
        ]}
      />
      <BookingHeader step={step} title={title} description={description} labels={MANAGE_STEP_LABELS} />
      <BookingLayout
        actionBar={actionBar === true ? "roomy" : actionBar === "stacked" ? "roomy-stacked" : actionBar}
        rail={<BookingHelpCard />}
      >
        {as === "form" ? (
          <form noValidate onSubmit={onSubmit} aria-label={label} className={card}>
            {children}
          </form>
        ) : (
          <div className={card}>{children}</div>
        )}
      </BookingLayout>
    </>
  );
}

/**
 * A page's single action (Find Appointment, Back, Proceed to Payment). Desktop: at the end of the
 * card, under a divider unless `divider={false}`. Mobile: pinned to the bottom of the screen in
 * Figma's 81px "Bottom Action Bar" — pass the button full width; the page passes
 * `actionBar="single"` to ManagePage so its content stays clear of the bar.
 */
export function PinnedAction({ children, divider = true }: { children: ReactNode; divider?: boolean }) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex border-t border-pneutral-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "lg:static lg:z-auto lg:bg-transparent lg:px-0 lg:pb-0",
        divider ? "lg:pt-6" : "lg:border-t-0 lg:pt-0",
      )}
    >
      {children}
    </div>
  );
}

/** Success pages (rescheduled / cancelled): the green band, then the details card and help rail. */
export function ManageSuccessPage({
  title,
  description,
  crumb,
  children,
}: {
  title: string;
  description: string;
  crumb: string;
  children: ReactNode;
}) {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Manage Appointment", href: "/manage-appointment" },
          { label: crumb },
        ]}
      />
      <SuccessHeader title={title} description={description} />
      <BookingLayout actionBar={false} rail={<BookingHelpCard />}>
        <div className="flex flex-col gap-6 px-4 py-6 lg:rounded-lg lg:border lg:border-pneutral-200 lg:bg-white lg:p-8">
          {children}
        </div>
      </BookingLayout>
    </>
  );
}

/** A ruled "label … value" row (Figma "Row - …": 14/20 Work Sans medium, 200px label column). */
export function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-t border-pneutral-200 py-3 font-heading text-typo-md font-medium",
        last && "border-b",
      )}
    >
      <dt className="w-[140px] shrink-0 text-pneutral-700 lg:w-[200px]">{label}</dt>
      <dd className="flex min-w-0 flex-1 justify-end text-right text-pneutral-900">{value}</dd>
    </div>
  );
}

export function Rows({ children }: { children: ReactNode }) {
  return <dl>{children}</dl>;
}

export const appointmentStatusBadge = (a: Appointment) =>
  a.status === "cancelled" ? (
    <StatusBadge tone="danger">Cancelled</StatusBadge>
  ) : (
    <StatusBadge tone="success">Confirmed</StatusBadge>
  );

/**
 * Paid / Payment Due / Refund Initiated (Figma G-02.03, G-03.08). A cancelled booking that was
 * never paid owes nothing, so it reads "Not applicable" (the wording of G-03.05 "Not Paid").
 */
export const paymentStatusBadge = (a: Appointment) =>
  a.paymentStatus === "paid" ? (
    <StatusBadge tone="success">Paid</StatusBadge>
  ) : a.paymentStatus === "due" ? (
    a.status === "cancelled" ? (
      "Not applicable"
    ) : (
      <StatusBadge tone="warning">Payment Due</StatusBadge>
    )
  ) : (
    <StatusBadge tone="warning">Refund Initiated</StatusBadge>
  );
