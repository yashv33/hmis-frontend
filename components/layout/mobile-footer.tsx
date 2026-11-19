import { Logo } from "@/components/ui/logo";

// Figma: "Footer" 246:2535 (375px) — mobile only; desktop uses <SiteFooter />.
// Link targets are placeholders — the destination pages are not designed yet.
// Guest (homepage, Figma 184:77818) says "Manage appointment"; signed in (246:2535) says "My Appointments".
const groups = (signedIn: boolean): { title: string; links: string[] }[] => [
  {
    title: "Patients",
    links: [
      "Book appointment",
      signedIn ? "My Appointments" : "Manage appointment",
      "Find a doctor",
      "International patients",
    ],
  },
  { title: "TiaMeds", links: ["About us", "Our hospitals", "Specialties", "Contact us"] },
];

// `block`: an inline Work Sans link inside a 24px Noto Sans line box would make every row 24px, not 20px.
const LINK =
  "block rounded-xsm font-heading text-typo-md font-medium text-pneutral-900 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

export function MobileFooter({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <footer className="flex flex-col gap-6 border-t border-pneutral-200 bg-white px-4 pb-6 pt-8 lg:hidden">
      <Logo className="h-[34.8px] w-[102px]" />
      <p className="font-paragraph text-typo-md text-pneutral-700">
        World-class, compassionate care across the TiaMeds hospital network.
      </p>
      <div className="flex gap-4">
        {groups(signedIn).map(({ title, links }) => (
          <nav key={title} aria-label={title} className="flex min-w-0 flex-1 flex-col gap-3">
            <h2 className="font-heading text-typo-sm font-semibold uppercase text-secondary-700">
              {title}
            </h2>
            <ul className="flex flex-col gap-3">
              {links.map((label) => (
                <li key={label}>
                  <a href="#" className={LINK}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-pneutral-200 pt-4 font-heading text-typo-sm text-pneutral-700">
        <p>© 2026 TiaMeds. All rights reserved.</p>
        <p>
          <a href="#" className="hover:underline">Privacy</a> ·{" "}
          <a href="#" className="hover:underline">Terms</a>
        </p>
      </div>
    </footer>
  );
}
