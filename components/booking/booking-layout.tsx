import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BookingHeader, type BookingStepNumber } from "./booking-header";

/**
 * Main card of a booking step (Figma "… Card" 107:6757): on desktop a white card with a neutral-200
 * border, 16px radius and 32px padding; on mobile the fields sit on the page with 16px gutters.
 * `gap` is the space between sections — 32px on Select Appointment Details, 24px on the later
 * steps; `mobileBottom` the room under the last section (24 or 32px) before the action bar.
 */
export function bookingCard({
  gap = 8,
  mobileBottom = 6,
}: { gap?: 6 | 8; mobileBottom?: 6 | 8 } = {}) {
  return cn(
    "flex flex-col px-4 pt-6 lg:rounded-lg lg:border lg:border-pneutral-200 lg:bg-white lg:p-8",
    gap === 8 ? "gap-8" : "gap-6",
    mobileBottom === 8 ? "pb-8" : "pb-6",
  );
}

/** The default card: 32px between sections. */
export const BOOKING_CARD = bookingCard();

export type MobileBarKind = "compact" | "roomy" | "roomy-stacked" | "single";

const BAR_ROOM: Record<MobileBarKind, string> = {
  compact: "pb-[73px]",
  roomy: "pb-[100px]",
  "roomy-stacked": "pb-[100px] max-sm:pb-[133px]",
  single: "pb-[81px]",
};

/**
 * "Main Section" of the booking steps: the 792px step card and the 384px right rail, 24px apart,
 * 32px below the page header (Figma 107:6755). The rail is desktop only.
 */
export function BookingLayout({
  children,
  rail,
  actionBar = true,
}: {
  children: ReactNode;
  rail?: ReactNode;
  /**
   * The fixed mobile bar the page ends in, so its last content stays clear of it: the booking
   * steps' 73px Back / Continue bar (`true`), the manage flow's 100px one ("roomy"; it stacks
   * into 133px under 640px with "roomy-stacked") or the 81px bar holding one 56px button ("single").
   */
  actionBar?: boolean | MobileBarKind;
}) {
  const kind: MobileBarKind | null = actionBar === true ? "compact" : actionBar || null;
  return (
    <div className={cn("lg:pb-7 lg:pt-8", kind && BAR_ROOM[kind])}>
      <div className="mx-auto flex w-full max-w-page items-start gap-6 lg:px-6 xl:px-0">
        <div className="min-w-0 flex-1 lg:max-w-[792px]">{children}</div>
        {rail && <aside className="hidden w-[384px] shrink-0 flex-col gap-6 lg:flex">{rail}</aside>}
      </div>
    </div>
  );
}

/** What a step shows before the session's booking is read (and while a guard redirects). */
export function BookingSkeleton({ step, title }: { step: BookingStepNumber; title: string }) {
  return (
    <>
      <BookingHeader step={step} title={title} />
      <div aria-busy="true" className={cn("min-h-[60vh]")} />
    </>
  );
}
