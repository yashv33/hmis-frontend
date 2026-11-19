import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { Container } from "./container";

// Figma: "Footer (DS footer)" 214:621 — desktop only (the mobile frame ends after the login card).
// Link targets are placeholders — the destination pages are not designed yet.
const PATIENT_LINKS = ["Book Appointment", "Manage Appointment", "Find a Doctor"];
// Signed-in footer (Figma 246:1994): "Manage Appointment" becomes "My Appointments".
const MEMBER_PATIENT_LINKS = ["Book Appointment", "My Appointments", "Find a Doctor"];
const HOSPITAL_LINKS = [
  "TiaMeds Hospital – Bengaluru",
  "TiaMeds Hospital – Chennai",
  "TiaMeds Hospital – Hyderabad",
];
const LEGAL_LINKS = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function LinkColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: string[];
  className: string;
}) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      {/* Figma draws the 1px underline inside a 9px bottom padding → 8px + 1px border here. */}
      <h2 className="border-b border-pneutral-900 pb-2 font-heading text-h5 font-medium text-pneutral-50">
        {title}
      </h2>
      <ul className="flex flex-col">
        {links.map((label) => (
          <li key={label} className="py-2">
            {/* `block`: an inline Work Sans link inside a Noto Sans line box grows the row to 41px (Figma: 40px). */}
            <a
              href="#"
              className={cn(
                "block font-heading text-typo-lg font-medium text-pneutral-50 hover:underline",
                FOCUS,
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactRow({
  icon,
  children,
  alignTop = false,
}: {
  icon: IconName;
  children: ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className={cn("flex gap-4", alignTop ? "items-start" : "items-center")}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xsm bg-secondary-500">
        <Icon name={icon} />
      </span>
      <div className="font-paragraph text-typo-lg text-pneutral-50">{children}</div>
    </div>
  );
}

export function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <footer className="hidden bg-primary-900 lg:block">
      <Container className="flex flex-col gap-6 py-20">
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-10">
          <div className="flex w-[310px] flex-col gap-[10px]">
            <p className="font-heading text-typo-xl font-medium text-pneutral-50">
              World-class, compassionate care across the TiaMeds hospital network.
            </p>
            <div className="flex w-fit items-center justify-center rounded-[8px] bg-pneutral-50 p-6">
              <Logo variant="footer" className="h-14 w-[121px]" />
            </div>
          </div>

          <LinkColumn
            title="Patients"
            links={signedIn ? MEMBER_PATIENT_LINKS : PATIENT_LINKS}
            className="w-[168px]"
          />
          <LinkColumn
            title="Our Hospitals"
            links={HOSPITAL_LINKS}
            className="w-[247px]"
          />

          <section className="flex w-[288px] flex-col gap-6">
            <h2 className="border-b border-pneutral-900 pb-2 font-heading text-h5 font-medium text-pneutral-50">
              Contact
            </h2>
            <div className="flex flex-col gap-6">
              <ContactRow icon="location-on" alignTop>
                <address className="whitespace-nowrap not-italic">
                  No. 59, 2nd Floor of Dakshina
                  <br />
                  Murthy Towers, Devanooru,
                  <br />
                  Rajeevnagara 2nd Stage
                  <br />
                  Udayagiri, Mysore
                  <br />
                  Karnataka – 570019
                </address>
              </ContactRow>
              <ContactRow icon="phone-solid">24×7 Helpline</ContactRow>
              <ContactRow icon="envelope-solid">
                <a
                  href="mailto:support@tiameds.ai"
                  className={cn("hover:underline", FOCUS)}
                >
                  support@tiameds.ai
                </a>
              </ContactRow>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 font-heading">
            <p className="text-typo-md text-pneutral-400">
              © 2026 TiaMeds. All rights reserved.
            </p>
            <p className="text-typo-sm text-pneutral-500">
              Empowering healthcare through technology innovation
            </p>
          </div>
          <ul className="flex items-center">
            {LEGAL_LINKS.map((label) => (
              <li key={label} className="pr-8 last:pr-0">
                <a
                  href="#"
                  className={cn(
                    "block font-heading text-typo-md font-medium text-pneutral-500 hover:text-pneutral-50 hover:underline",
                    FOCUS,
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
