import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { HOSPITALS } from "@/lib/home/content";

/**
 * "Our Hospitals Section" — Figma 123:16920 (desktop: three 384px cards) / 184:77762 (mobile:
 * stacked cards with Directions + Book buttons). "Book at this hospital" opens Find a Doctor
 * filtered to that hospital.
 */
export function HospitalsSection() {
  return (
    <section aria-label="Our hospitals" className="bg-white">
      {/* ---------- mobile ---------- */}
      <div className="flex flex-col gap-6 px-4 py-7 lg:hidden">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-typo-sm font-semibold uppercase text-secondary-700">
            Our hospitals
          </p>
          <h2 className="font-heading text-h2 font-light text-pneutral-900">
            Care, <span className="font-semibold text-secondary-800">close to home.</span>
          </h2>
          <p className="font-paragraph text-typo-lg text-pneutral-700">
            Book at any TiaMeds hospital that is open for online appointments.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {HOSPITALS.map((h) => (
            <li
              key={h.id}
              className="flex flex-col gap-4 rounded-lg border border-pneutral-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex shrink-0 rounded-full bg-secondary-50 p-3">
                  <Icon name="hospital-building-sm" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="font-heading text-typo-lg font-semibold text-pneutral-900">
                    {h.name}
                  </h3>
                  <p className="font-heading text-typo-sm text-pneutral-700">{h.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  href={h.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  tone="secondary"
                  size="sm"
                  shape="pill"
                  aria-label={`Directions to ${h.name} (opens in a new tab)`}
                >
                  Directions
                </Button>
                <Button
                  href={h.bookHref}
                  size="sm"
                  shape="pill"
                  aria-label={`Book at this hospital: ${h.name}`}
                  className="min-w-[167px]"
                >
                  Book at this hospital
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button href="/hospitals" variant="outlined" tone="secondary" shape="pill" fullWidth>
          See all 8 hospitals
        </Button>
      </div>

      {/* ---------- desktop ---------- */}
      <div className="hidden py-8 lg:block">
        <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-6 pt-8 xl:px-0">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-h3 font-semibold text-pneutral-900">Our Hospitals</h2>
            <p className="font-paragraph text-typo-lg text-pneutral-700">
              Book at any TiaMeds hospital that is open for online appointments.
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-6">
            {HOSPITALS.map((h) => (
              <li key={h.id}>
                <Link
                  href={h.bookHref}
                  className="group flex h-full flex-col items-start gap-3 rounded-xsm border border-pneutral-200 bg-white p-6 outline-none transition-colors duration-150 hover:border-secondary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700"
                >
                  <span className="flex size-11 items-center justify-center rounded-xsm bg-secondary-50">
                    <Icon name="hospital-building" />
                  </span>
                  <h3 className="font-heading text-h6 font-semibold text-pneutral-900">{h.name}</h3>
                  <span className="flex items-center gap-2 font-paragraph text-typo-md text-pneutral-700">
                    <Icon name="location-sm" />
                    {h.location}
                  </span>
                  <span className="inline-flex items-center gap-1 font-paragraph text-typo-md font-semibold text-primary-800 group-hover:underline">
                    Book at this hospital
                    <Icon name="arrow-right" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
