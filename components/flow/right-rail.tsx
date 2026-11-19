import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Callout } from "@/components/ui/callout";

type RightRailProps = {
  /** "Keep your account safe" is shown on every screen except the success screen. */
  safetyNotice?: boolean;
};

/** "Right Rail" — Figma 283:155595, 384px wide, desktop only (the mobile frames have none). */
export function RightRail({ safetyNotice = true }: RightRailProps) {
  return (
    <aside className="hidden w-[384px] shrink-0 flex-col gap-6 lg:flex">
      {safetyNotice && (
        <Callout tone="info" title="Keep your account safe">
          We&apos;ll never ask for your password or OTP by phone, email or WhatsApp.
        </Callout>
      )}
      <BookingHelpCard />
    </aside>
  );
}
