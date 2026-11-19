import type { ReactNode } from "react";
import { AccessBand } from "@/components/login/access-band";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RightRail } from "./right-rail";

// All forgot-password screens share the same trail in Figma.
const BREADCRUMB = [
  { label: "Home", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Forgot Password" },
];

type FlowLayoutProps = {
  /** <PageHeader /> or <SuccessHeader />. */
  header: ReactNode;
  /** Show "Keep your account safe" above the help card (not on the success screen). */
  safetyNotice?: boolean;
  /** Card contents — a <form> (or a plain wrapper) that is `flex flex-col gap-6`. */
  children: ReactNode;
};

/**
 * Shared frame of every forgot-password screen:
 *  desktop — header (with Login) · breadcrumb · title band · card + right rail · access band · footer
 *  mobile  — header (with Log in) · title band · content · fixed bottom action bar
 */
export function FlowLayout({ header, safetyNotice = true, children }: FlowLayoutProps) {
  return (
    <>
      <DesktopHeader showLogin />
      <MobileHeader showLogin />
      <Breadcrumb items={BREADCRUMB} />
      {/* Mobile bottom padding keeps content clear of the fixed 73px action bar. */}
      <main className="flex flex-1 flex-col bg-white pb-[calc(4.5625rem+env(safe-area-inset-bottom))] lg:pb-0">
        {header}
        <div className="px-4 pb-8 pt-6 lg:px-0 lg:pb-7 lg:pt-8">
          <div className="mx-auto flex w-full max-w-page flex-col gap-6 lg:flex-row lg:items-start lg:px-6 xl:px-0">
            {/* The card chrome only exists on desktop; on mobile the content sits on the page. */}
            <div className="flex min-w-0 flex-1 flex-col lg:rounded-lg lg:border lg:border-pneutral-200 lg:bg-white lg:p-8">
              {children}
            </div>
            <RightRail safetyNotice={safetyNotice} />
          </div>
        </div>
      </main>
      <AccessBand variant="flow" />
      <SiteFooter />
    </>
  );
}
