import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { PAGE_COLUMN, PageTitle } from "./booking-header";

/**
 * The success band shared by "Appointment Booked / Rescheduled / Cancelled Successfully" (Figma
 * "Success Header" 161:47832): a 72px (64px on mobile) green tile with a check, the 36px title and
 * a one-line description, on the lavender page band.
 */
export function SuccessHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-secondary-50">
      <div className={cn(PAGE_COLUMN, "flex flex-col items-start gap-3 py-6 lg:gap-4 lg:py-8")}>
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-success-50 lg:size-[72px]">
          <Icon name="check-circle-success-sm" className="lg:hidden" />
          <Icon name="check-circle-success" className="hidden lg:block" />
        </span>
        <PageTitle>{title}</PageTitle>
        <p className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">{description}</p>
      </div>
    </div>
  );
}
