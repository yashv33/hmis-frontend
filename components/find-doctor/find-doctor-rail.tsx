import Image from "next/image";
import { BookingHelpCard } from "@/components/layout/booking-help-card";
import { Icon } from "@/components/ui/icon";

/** "International Patients Card" — Figma 246:1950. The link target is a placeholder. */
function InternationalPatientsCard() {
  return (
    <section
      aria-labelledby="international-title"
      className="flex flex-col overflow-hidden rounded-xsm border border-pneutral-200 bg-white"
    >
      {/* Figma crops the photo to 160px; the artwork is stretched to 200% of the frame height. */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src="/images/international-patients.png"
          alt="A TiaMeds doctor in a stethoscope and white coat, smiling in the hospital lobby"
          width={1024}
          height={1280}
          sizes="282px"
          className="pointer-events-none absolute left-0 top-[-16%] h-[200%] w-full max-w-none"
        />
      </div>
      <div className="flex flex-col items-start gap-2 p-5">
        <h2
          id="international-title"
          className="font-heading text-typo-lg font-semibold text-pneutral-900"
        >
          Travelling for treatment?
        </h2>
        <p className="font-paragraph text-typo-md text-pneutral-700">
          Visa, travel and interpreter support for patients from abroad.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-1 rounded-xsm font-paragraph text-typo-md font-semibold text-primary-800 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700"
        >
          Learn More
          <Icon name="arrow-right" />
        </a>
      </div>
    </section>
  );
}

/** "Right Rail" — Figma 246:1942, 282px wide, desktop only. */
export function FindDoctorRail() {
  return (
    <aside aria-label="Help and international patients" className="hidden w-[282px] shrink-0 flex-col gap-6 lg:flex">
      <BookingHelpCard />
      <InternationalPatientsCard />
    </aside>
  );
}
