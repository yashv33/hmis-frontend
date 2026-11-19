"use client";

import { DialogButton } from "@/components/app/dialog-link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSignedIn } from "@/lib/session/auth";

const HELPLINE_HREF = "tel:+919812312489";

/**
 * "Help Section" — Figma 246:2526 (mobile only; desktop has the right rail instead).
 * Guests get the designed helpline sheet (G-01.00 Helpline, Mobile Overlay) from the call
 * button; signed-in members keep a direct `tel:` link, as their frames have no sheet.
 */
export function HelpSection() {
  const signedIn = useSignedIn();
  const callProps = { size: "lg", shape: "pill", fullWidth: true, icon: "phone-outline-lg" } as const;
  return (
    <section aria-labelledby="mobile-help-title" className="bg-white px-4 py-7 lg:hidden">
      <div className="flex flex-col items-start gap-4 rounded-lg bg-secondary-50 p-6">
        <span className="flex rounded-full bg-white p-3">
          <Icon name="phone-lg" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id="mobile-help-title" className="font-heading text-h6 font-semibold text-pneutral-900">
            Need help booking?
          </h2>
          <p className="font-paragraph text-typo-md text-pneutral-700">
            Our team can find the right doctor and book for you.
          </p>
        </div>
        {signedIn ? (
          <Button href={HELPLINE_HREF} {...callProps}>
            Call +91 98123 12489
          </Button>
        ) : (
          <DialogButton dialog={{ kind: "helpline" }} fallbackHref={HELPLINE_HREF} {...callProps}>
            Call +91 98123 12489
          </DialogButton>
        )}
        <p className="font-heading text-typo-sm text-pneutral-700">
          Or email{" "}
          <a
            href="mailto:support@tiameds.ai"
            className="rounded-xsm outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700"
          >
            support@tiameds.ai
          </a>
        </p>
      </div>
    </section>
  );
}
