"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { MobileFooter } from "@/components/layout/mobile-footer";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AccessBand } from "@/components/login/access-band";
import { useSignedIn } from "@/lib/session/auth";
import { AccountMenu } from "./account-menu";
import { AppShellProvider } from "./app-shell";
import { GuestLoginButton, MobileHeaderActions } from "./mobile-header-actions";
import { PrimaryNavItems } from "./primary-nav-items";
import { SkipLink } from "./skip-link";

/**
 * Header, `<main>` and footers of the public site. One page, two chromes (mock session, see
 * `lib/session/auth.ts`):
 *   guest   — Figma G-01: "Login" button (opens the Log in overlay), "Manage Appointment" access
 *             card, guest footer; mobile gets the "Log in" pill and the guest menu
 *   member  — Figma R-00: account dropdown, "My Appointments" access card, member footer
 * The first paint is always the guest chrome; a signed-in visitor sees it swap on hydration.
 */
function SiteChrome({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  // The booking and manage-appointment flows end at their action bar on mobile (no footer in
  // those frames); desktop keeps the access band and footer.
  const pathname = usePathname();
  const inFlow = /^\/(book-appointment|manage-appointment)(\/|$)/.test(pathname);
  return (
    <>
      <SkipLink />
      <DesktopHeader
        nav={<PrimaryNavItems highlightActive={signedIn} />}
        account={signedIn ? <AccountMenu /> : <GuestLoginButton />}
      />
      <MobileHeader actions={<MobileHeaderActions guest={!signedIn} />} />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <AccessBand variant={signedIn ? "member" : "login"} />
      <SiteFooter signedIn={signedIn} />
      {!inFlow && <MobileFooter signedIn={signedIn} />}
    </>
  );
}

/** The provider (menu + overlay state) around the chrome — used by the `(app)` layout and `/`. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <SiteChrome>{children}</SiteChrome>
    </AppShellProvider>
  );
}
