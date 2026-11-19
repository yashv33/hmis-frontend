import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Container } from "./container";

// Figma: "Header (topbar)" 214:299 · "Header (Header without social)" 214:360
// Link targets are placeholders — the destination pages are not designed yet.
const NAV_ITEMS: { label: string; icon: IconName; href: string }[] = [
  { label: "Find a Doctor", icon: "magnifying-glass-outline", href: "#" },
  { label: "Specialties", icon: "heart-outline", href: "#" },
  { label: "Hospitals", icon: "building-office-outline", href: "#" },
  { label: "International Patients", icon: "globe-alt-outline", href: "#" },
];

const SOCIAL_LINKS: { label: string; icon: IconName; href: string }[] = [
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "LinkedIn", icon: "linkedin", href: "#" },
  { label: "X", icon: "x", href: "#" },
];

type DesktopHeaderProps = {
  /**
   * Shows the filled "Login" button at the right of the nav (Figma "Login Button",
   * hidden on the login page itself, visible on the forgot-password screens).
   */
  showLogin?: boolean;
  /**
   * Logged-in header (Figma "Logged-in Header" 213:256): the nav buttons come from the menu
   * config (`nav`) and the Login button is replaced by the account dropdown (`account`),
   * right-aligned in the same 108px slot.
   */
  nav?: ReactNode;
  account?: ReactNode;
};

/**
 * Desktop only (lg+). Below lg the page uses <MobileHeader />.
 * Sticky: the Figma prototype pins both header rows ("Fixed Header", 127px) over the scrolling page.
 */
export function DesktopHeader({ showLogin = false, nav, account }: DesktopHeaderProps) {
  return (
    <header className="sticky top-0 z-40 hidden bg-white lg:block">
      {/* Top bar — 52px */}
      <Container className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <Button
            href="tel:+919812312489"
            variant="text"
            size="sm"
            icon="phone-outline"
          >
            +91 98123 12489
          </Button>
          <Button
            href="mailto:support@tiameds.ai"
            variant="text"
            size="sm"
            icon="envelope-outline"
          >
            support@tiameds.ai
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            tone="deep"
            size="sm"
            iconOnly
            icon="magnifying-glass-mini"
            aria-label="Search"
          />
          {SOCIAL_LINKS.map(({ label, icon, href }) => (
            <Button
              key={label}
              href={href}
              variant="text"
              size="sm"
              iconOnly
              icon={icon}
              aria-label={label}
            />
          ))}
        </div>
      </Container>

      {/* Main nav — 74px. Logo + nav fill the row; the right 108px (+24px gap) is the "Login Button" slot. */}
      <div className="mx-auto flex w-full max-w-page items-center gap-6 px-6 py-2 xl:px-0">
        <div className="flex min-w-0 flex-1 items-center justify-between">
          <Link href="/" aria-label="TiaMeds home">
            <Logo className="h-[58px] w-[170px]" />
          </Link>
          {/* Tighter below xl so logo + nav + Login still fit at 1024px. */}
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 xl:gap-4 [--btn-px:0.5rem] xl:[--btn-px:1rem]"
          >
            {nav ??
              NAV_ITEMS.map(({ label, icon, href }) => (
                <Button key={label} href={href} variant="text" size="md" icon={icon}>
                  {label}
                </Button>
              ))}
          </nav>
        </div>
        {account ? (
          <div className="flex w-[108px] shrink-0 justify-end">{account}</div>
        ) : showLogin ? (
          <Button href="/login" size="md" icon="user-circle-solid">
            Login
          </Button>
        ) : (
          <span aria-hidden="true" className="hidden w-[108px] xl:block" />
        )}
      </div>
    </header>
  );
}
