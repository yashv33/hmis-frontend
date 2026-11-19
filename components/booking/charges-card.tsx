import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { chargesFor, paymentRequirement, paymentRequirementLabel, rupees } from "@/lib/booking/charges";
import type { BookingDraft } from "@/lib/booking/store";
import type { Doctor } from "@/lib/find-doctor/types";

/**
 * One charge row (Figma "Charge - …"): a 180px label column and the value, 16px apart. Every row
 * after the first has a top rule; the total is a grey 16/24 semibold row whose value wraps onto
 * two lines ("₹500 +" / "applicable tax").
 */
function ChargeRow({
  label,
  value,
  first = false,
  total = false,
}: {
  label: string;
  value: ReactNode;
  first?: boolean;
  total?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 font-heading",
        !first && "border-t border-pneutral-200",
        total
          ? "bg-pneutral-50 py-3 text-typo-lg font-semibold text-pneutral-900"
          : "py-3 text-typo-md font-medium",
      )}
    >
      <dt className={cn("w-[180px] shrink-0", !total && "text-pneutral-700")}>{label}</dt>
      <dd className={cn("min-w-0 flex-1 text-right", !total && "text-pneutral-900")}>{value}</dd>
    </div>
  );
}

/**
 * Figma "Consultation Charges Card" (129:25377) — desktop right rail, and at the end of the summary
 * on mobile: fee, discount, tax, the total on a grey row and the payment requirement, with the
 * billing footnote.
 */
export function ChargesCard({ doctor, draft, className }: { doctor: Doctor; draft: BookingDraft; className?: string }) {
  const charges = chargesFor(doctor);
  return (
    <section
      aria-label="Consultation charges"
      className={cn("flex flex-col gap-3 rounded-lg border border-pneutral-200 bg-white p-4 lg:p-6", className)}
    >
      <h2 className="font-heading text-h6 font-semibold text-pneutral-900">Consultation Charges</h2>
      <dl>
        <ChargeRow first label="Consultation Fee" value={rupees(charges.fee)} />
        <ChargeRow label="Discount Amount" value={rupees(charges.discount)} />
        <ChargeRow label="Tax Amount" value="As applicable" />
        <ChargeRow total label="Total Amount" value={charges.totalLabel} />
        <ChargeRow label="Payment Requirement" value={paymentRequirementLabel(paymentRequirement(draft))} />
      </dl>
      <p className="font-heading text-typo-sm text-pneutral-700">
        The final amount is confirmed by billing before you pay.
      </p>
    </section>
  );
}
