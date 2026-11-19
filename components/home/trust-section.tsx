import { Icon } from "@/components/ui/icon";
import { TRUST_TILES } from "@/lib/home/content";

/**
 * "Trust Section" — Figma 123:16824 (desktop: four 282px tiles) / 184:77878 (mobile: 2×2).
 * No visible heading in the design, so it is labelled for screen readers only.
 */
export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="bg-white px-4 pb-6 lg:px-6 lg:pb-7 lg:pt-4 xl:px-0">
      <h2 id="trust-title" className="sr-only">
        Why book with TiaMeds
      </h2>
      <ul className="mx-auto grid max-w-page grid-cols-2 items-start gap-3 lg:grid-cols-4 lg:items-stretch lg:gap-6">
        {TRUST_TILES.map(({ title, text, icon }) => (
          <li
            key={title}
            className="flex flex-col items-center gap-3 rounded-lg bg-pneutral-50 p-4 text-center lg:p-6"
          >
            <Icon name={icon} />
            <h3 className="font-heading text-typo-lg font-semibold text-pneutral-900">{title}</h3>
            <p className="font-heading text-typo-sm text-pneutral-700">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
