import type { Metadata } from "next";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AccessBand } from "@/components/login/access-band";
import { LoginSection } from "@/components/login/login-section";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to the TiaMeds patient portal.",
};

// Figma section "R-01 Step 1 - Login" (214:87)
//   desktop  → 214:88  (+ 214:693 incorrect details)
//   mobile   → 214:1061 (+ 214:1252 incorrect details)
export default function LoginPage() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 bg-secondary-50 lg:bg-white">
        <LoginSection />
        <AccessBand />
      </main>
      <SiteFooter />
    </>
  );
}
