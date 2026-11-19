import type { Metadata } from "next";
import { SiteShell } from "@/components/app/site-chrome";
import { HelpSection } from "@/components/layout/help-section";
import { HomeHero } from "@/components/home/hero";
import { HospitalsSection } from "@/components/home/hospitals-section";
import { SpecialtiesSection } from "@/components/home/specialties-section";
import { TrustSection } from "@/components/home/trust-section";

export const metadata: Metadata = {
  title: { absolute: "TiaMeds — Your health, our priority" },
  description:
    "Book appointments with trusted doctors across 8 TiaMeds hospitals. No account needed.",
};

// Figma "G-01.00 Patient Web Portal Homepage (Option B)" — desktop 184:78009, mobile 184:77613.
// The public landing page: header, menus, access band and footers come from the shared site
// chrome (guest variant until the mock session says otherwise).
export default function HomePage() {
  return (
    <SiteShell>
      <HomeHero />
      <TrustSection />
      <SpecialtiesSection />
      <HospitalsSection />
      <HelpSection />
    </SiteShell>
  );
}
