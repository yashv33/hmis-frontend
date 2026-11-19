import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * A block of the booking summary ("Patient Details", "Appointment Details", "Booking Contact"):
 * a 20/28 title, optionally with an "Edit" text button on the right, then ruled rows.
 */
export function SummarySection({
  title,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  onEdit?: () => void;
  /** Accessible name of the Edit button ("Edit patient details"). */
  editLabel?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-h6 font-semibold text-pneutral-900">{title}</h2>
        {onEdit && (
          <Button variant="text" size="sm" shape="rounded" onClick={onEdit} aria-label={editLabel ?? `Edit ${title.toLowerCase()}`}>
            Edit
          </Button>
        )}
      </div>
      <dl>{children}</dl>
    </section>
  );
}

/** A ruled "label … value" row (14/20 Work Sans medium); the last row of a section closes the rule. */
export function SummaryRow({
  label,
  mobileLabel,
  value,
  last = false,
  className,
}: {
  label: string;
  /** Shorter label on mobile ("Registration Status"). */
  mobileLabel?: string;
  value: ReactNode;
  last?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-t border-pneutral-200 py-3 font-heading text-typo-md font-medium",
        last && "border-b",
        className,
      )}
    >
      <dt className="w-[120px] shrink-0 text-pneutral-700 lg:w-[220px]">
        {mobileLabel ? (
          <>
            <span className="lg:hidden">{mobileLabel}</span>
            <span className="hidden lg:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </dt>
      <dd className="flex min-w-0 flex-1 items-center justify-end gap-4 text-right text-pneutral-900">{value}</dd>
    </div>
  );
}
