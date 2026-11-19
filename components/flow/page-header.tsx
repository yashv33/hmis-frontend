import { Icon } from "@/components/ui/icon";

/**
 * "Page Header" band — Figma 283:155524 (desktop) / 283:155785 (mobile).
 * Lavender band with the screen title and one line of description.
 */
export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-secondary-50">
      <div className="mx-auto flex w-full max-w-page flex-col gap-2 px-4 py-6 lg:px-6 lg:pb-8 lg:pt-6 xl:px-0">
        <h1 className="font-heading text-h4 font-semibold text-pneutral-900 lg:text-h2">
          {title}
        </h1>
        <p className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * "Success Header" — Figma 283:158067 (desktop) / 283:158291 (mobile).
 * Replaces the page header on the final screen: green check badge, title, description.
 */
export function SuccessHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-secondary-50">
      <div className="mx-auto flex w-full max-w-page flex-col items-start gap-3 px-4 py-6 lg:gap-4 lg:px-6 lg:py-8 xl:px-0">
        <span className="rounded-full bg-success-50 p-4">
          {/* Figma uses a 32px check on mobile and a 40px one on desktop. */}
          <Icon name="check-circle-success-sm" className="lg:hidden" />
          <Icon name="check-circle-success" className="hidden lg:block" />
        </span>
        <h1 className="font-heading text-h4 font-semibold text-pneutral-900 lg:text-h2">
          {title}
        </h1>
        <p className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
