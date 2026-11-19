import { DialogButton } from "@/components/app/dialog-link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * "Booking Help Card" — Figma 283:155602 (forgot-password right rail, 384px) and
 * 246:1943 / 61:3827 (Find a Doctor right rail, 282px). Same content in both; desktop only.
 * "Call 24×7 Helpline" opens the helpline overlay (a plain tel: link outside the site shell).
 */
export function BookingHelpCard() {
  return (
    <section
      aria-labelledby="booking-help-title"
      className="flex flex-col items-start gap-4 rounded-xsm bg-secondary-50 p-6"
    >
      <span className="flex size-11 items-center justify-center rounded-xsm bg-white">
        <Icon name="help-tile" />
      </span>
      <h2 id="booking-help-title" className="font-heading text-h6 font-semibold text-pneutral-900">
        Need help booking?
      </h2>
      <p className="font-paragraph text-typo-md text-pneutral-700">
        Our care team can help you find the right doctor and a time that suits you.
      </p>
      <DialogButton
        dialog={{ kind: "helpline" }}
        fallbackHref="tel:+919812312489"
        fullWidth
        icon="phone-outline-md"
      >
        Call 24×7 Helpline
      </DialogButton>
      <Button
        href="https://wa.me/919812312489"
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        tone="brand"
        fullWidth
        icon="chat-bubble-left-ellipsis-outline"
      >
        Chat on WhatsApp
      </Button>
    </section>
  );
}
