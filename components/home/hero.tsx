import Image from "next/image";
import Link from "next/link";
import { DialogLink } from "@/components/app/dialog-link";
import { Icon, type IconName } from "@/components/ui/icon";

const CARD =
  "flex w-full items-center gap-4 rounded-lg bg-white p-4 shadow-card outline-none transition-shadow duration-150 hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700 lg:gap-6 lg:p-8";

/** Icon tile + title + text + chevron (Figma "Book Appointment Card" / "Manage Appointment Card"). */
function CardContent({ title, text, icon }: { title: string; text: string; icon: IconName }) {
  return (
    <>
      <span className="flex shrink-0 rounded-sm bg-secondary-50 p-4">
        <Icon name={icon} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 text-left">
        <span className="font-heading text-h6 font-semibold text-primary-800 lg:text-h4">
          {title}
        </span>
        <span className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">{text}</span>
      </span>
      <Icon name="chevron-right-lg" />
    </>
  );
}

/**
 * "Hero Block" — Figma 184:78011;123:16799 (desktop 1440×636) and 184:77857 (mobile 375×724).
 * A photo under a 50% deep-purple overlay with the headline, and the two action cards. On
 * desktop the cards overlap the bottom 100px of the photo; on mobile they sit below it.
 * "Book Appointment" opens Find a Doctor; "Manage Appointment" (a button in the design) opens
 * the "Manage your appointment" overlay.
 */
export function HomeHero() {
  return (
    <section aria-labelledby="home-title" className="bg-white">
      <div className="relative h-[360px] overflow-hidden lg:h-[540px]">
        {/* Decorative: the headline carries the message. Same photo as the login slider. */}
        <Image
          src="/images/preview-photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-secondary-900/50" />
        <div className="relative mx-auto flex w-full max-w-page flex-col gap-4 px-4 pt-36 text-white lg:px-6 lg:pt-[120px] xl:px-0">
          <h1
            id="home-title"
            className="font-heading text-h1 font-light lg:text-display-sm lg:font-semibold"
          >
            Your health,{" "}
            <br />
            our priority.
          </h1>
          <p className="max-w-[343px] font-paragraph text-typo-lg lg:max-w-[588px] lg:text-typo-xl">
            Book appointments with trusted doctors across 8 TiaMeds hospitals. No account needed.
          </p>
        </div>
      </div>

      <ul className="relative z-10 mx-auto flex w-full max-w-page flex-col gap-3 px-4 pb-6 pt-4 lg:-mt-[100px] lg:flex-row lg:gap-6 lg:px-6 lg:pb-10 lg:pt-0 xl:px-0">
        <li className="flex-1">
          <Link href="/find-doctor" className={CARD}>
            <CardContent
              title="Book Appointment"
              text="Find a doctor, choose a time and book in a few steps."
              icon="calendar-hero"
            />
          </Link>
        </li>
        <li className="flex-1">
          <DialogLink dialog={{ kind: "manage" }} fallbackHref="/find-doctor" className={CARD}>
            <CardContent
              title="Manage Appointment"
              text="View, reschedule or cancel an appointment you've booked."
              icon="arrow-path-hero"
            />
          </DialogLink>
        </li>
      </ul>
    </section>
  );
}
