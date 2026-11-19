"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
} from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * "Portal Preview Slider" — Figma component set 242:1739 (4 slides × Desktop/Mobile).
 * Per the component description it auto-advances every 4s and the dots jump to a slide.
 *
 * Slide content is lifted straight from the Figma variants. Where desktop and mobile
 * differ (card position, doctor photo size, badge/chip, 3rd family member, slide-3
 * title) the differences are expressed with `lg:` classes and per-platform values.
 */
const AUTO_ADVANCE_MS = 4000;

type Member = { name: string; relation: string; desktopOnly?: boolean };

type Slide = {
  id: string;
  eyebrow: string;
  title?: { desktop: string; mobile: string };
  detail?: string;
  doctorPhoto?: boolean;
  /** Status badge, desktop only. */
  badge?: string;
  /** Pill floating over the photo, desktop only. */
  chip?: string;
  members?: Member[];
  /** Distance of the white card from the top of the photo, in px. */
  cardTop: { mobile: number; desktop: number };
  /** Horizontal `object-position` of the 7:3 photo (Figma crop offset). */
  photoX: { mobile: string; desktop: string };
};

const SLIDES: Slide[] = [
  {
    id: "upcoming",
    eyebrow: "UPCOMING APPOINTMENT",
    title: {
      desktop: "Dr. Rajesh Kumar · Cardiology",
      mobile: "Dr. Rajesh Kumar · Cardiology",
    },
    detail: "Thu, 05 Nov · 10:30 AM",
    doctorPhoto: true,
    badge: "Confirmed",
    chip: "3 family members linked",
    cardTop: { mobile: 78, desktop: 190 },
    photoX: { mobile: "100%", desktop: "100%" },
  },
  {
    id: "family",
    eyebrow: "FAMILY MEMBERS",
    members: [
      { name: "Priya Kumar", relation: "Spouse" },
      { name: "Aarav Kumar", relation: "Son" },
      { name: "Sita Kumar", relation: "Mother", desktopOnly: true },
    ],
    cardTop: { mobile: 22, desktop: 90 },
    photoX: { mobile: "100%", desktop: "100%" },
  },
  {
    id: "rescheduled",
    eyebrow: "APPOINTMENT RESCHEDULED",
    title: {
      desktop: "Thu 05 Nov, 10:30 AM → Sat 07 Nov, 11:30 AM",
      mobile: "Sat, 07 Nov · 11:30 AM",
    },
    detail: "Same doctor, new time. No calls needed.",
    badge: "Confirmed",
    cardTop: { mobile: 78, desktop: 190 },
    photoX: { mobile: "27.27%", desktop: "23.54%" },
  },
  {
    id: "payment",
    eyebrow: "PAYMENT RECEIVED",
    title: {
      desktop: "₹500 · Consultation fee",
      mobile: "₹500 · Consultation fee",
    },
    detail: "Receipt sent to your email.",
    badge: "Paid",
    cardTop: { mobile: 78, desktop: 190 },
    photoX: { mobile: "100%", desktop: "100%" },
  },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Work Sans (Google's latin subset) has no "→", so browsers fall back to a ~22px
 * system arrow where Figma's glyph is ~12px — enough to push the "Confirmed" badge
 * of slide 3 out of the photo. A monospace-stack arrow is ~12px everywhere.
 */
function TitleText({ text }: { text: string }) {
  const [first, ...rest] = text.split("→");
  return (
    <>
      {first}
      {rest.map((part, index) => (
        <span key={index}>
          <span className="font-mono">→</span>
          {part}
        </span>
      ))}
    </>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full bg-success-50 py-1 pl-2 pr-3">
      <Icon name="status-dot" />
      <span className="font-heading text-typo-sm font-semibold text-pneutral-900">
        {label}
      </span>
    </span>
  );
}

function Member({ name, relation, desktopOnly }: Member) {
  return (
    <div
      className={cn("items-center gap-3", desktopOnly ? "hidden lg:flex" : "flex")}
    >
      {/* AvatarBase: 24px circle with the 26px user glyph clipped inside */}
      <span className="relative size-6 shrink-0 overflow-clip rounded-full border-[1.5px] border-white bg-pneutral-50">
        <span className="absolute left-1/2 top-[calc(50%+4px)] -translate-x-1/2 -translate-y-1/2">
          <Icon name="avatar-user" />
        </span>
      </span>
      <span className="flex flex-col font-heading text-typo-md font-medium">
        <span className="text-pneutral-900">{name}</span>
        <span className="text-pneutral-700">{relation}</span>
      </span>
    </div>
  );
}

function SlideLayer({ slide, active }: { slide: Slide; active: boolean }) {
  const { title, members } = slide;
  const vars = {
    "--card-top-m": `${slide.cardTop.mobile}px`,
    "--card-top-d": `${slide.cardTop.desktop}px`,
  } as CSSProperties;

  return (
    <div
      aria-hidden={!active}
      style={vars}
      className={cn(
        "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {slide.chip && (
        // Figma: left 326px / top 24px on the 588px desktop slide.
        <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 shadow-soft lg:flex xl:left-[326px] xl:right-auto">
          <span className="rounded-full bg-secondary-50 p-2">
            <Icon name="user-group-outline" />
          </span>
          <span className="whitespace-nowrap font-heading text-typo-md font-medium text-pneutral-900">
            {slide.chip}
          </span>
        </div>
      )}

      <div
        className={cn(
          "absolute left-3 top-(--card-top-m) flex max-w-[calc(100%-1.5rem)] gap-3 rounded-sm bg-white p-3 shadow-soft",
          "lg:left-6 lg:top-(--card-top-d) lg:max-w-[calc(100%-3rem)] lg:p-4 xl:max-w-none",
          members ? "flex-col items-start" : "items-center",
        )}
      >
        {slide.doctorPhoto && (
          <span className="relative size-10 shrink-0 overflow-hidden rounded-sm lg:size-12">
            <Image
              src="/images/doctor-photo.png"
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
        )}

        {members ? (
          <>
            <p className="font-heading text-typo-sm font-semibold text-secondary-700">
              {slide.eyebrow}
            </p>
            {members.map((member) => (
              <Member key={member.name} {...member} />
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-1 xl:whitespace-nowrap">
            <p className="font-heading text-typo-sm font-semibold text-secondary-700">
              {slide.eyebrow}
            </p>
            {title && (
              <p className="font-heading text-typo-md font-medium text-pneutral-900 lg:text-h6 lg:font-semibold">
                {title.mobile === title.desktop ? (
                  <TitleText text={title.desktop} />
                ) : (
                  <>
                    <span className="lg:hidden">
                      <TitleText text={title.mobile} />
                    </span>
                    <span className="hidden lg:inline">
                      <TitleText text={title.desktop} />
                    </span>
                  </>
                )}
              </p>
            )}
            {slide.detail && (
              <p className="font-heading text-typo-md font-medium text-pneutral-700">
                {slide.detail}
              </p>
            )}
          </div>
        )}

        {slide.badge && (
          <span className="hidden lg:block">
            <Badge label={slide.badge} />
          </span>
        )}
      </div>
    </div>
  );
}

export function PortalPreviewSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false,
  );

  // Auto-advance every 4s. Restarting on every change means a manual jump gets a full 4s too.
  // Paused while hovered/focused and for users who prefer reduced motion.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setTimeout(
      () => setActive((index) => (index + 1) % SLIDES.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearTimeout(timer);
  }, [active, paused, reducedMotion]);

  const photoStyle = {
    "--photo-x-m": SLIDES[active].photoX.mobile,
    "--photo-x-d": SLIDES[active].photoX.desktop,
  } as CSSProperties;

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Portal highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={handleBlur}
      className="flex w-full flex-col items-center gap-3"
    >
      <div
        aria-live={paused ? "polite" : "off"}
        className="relative h-[180px] w-full overflow-hidden rounded-lg lg:h-[320px]"
      >
        <Image
          src="/images/preview-photo.png"
          alt=""
          fill
          sizes="(min-width: 1280px) 588px, (min-width: 1024px) 50vw, 100vw"
          loading="eager"
          fetchPriority="high"
          style={photoStyle}
          className="pointer-events-none object-cover [object-position:var(--photo-x-m)_50%] transition-[object-position] duration-500 ease-in-out motion-reduce:transition-none lg:[object-position:var(--photo-x-d)_50%]"
        />
        {SLIDES.map((slide, index) => (
          <SlideLayer key={slide.id} slide={slide} active={index === active} />
        ))}
      </div>

      <div role="group" aria-label="Choose slide" className="flex items-end gap-[6px]">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show slide ${index + 1} of ${SLIDES.length}`}
            aria-current={index === active || undefined}
            onClick={() => setActive(index)}
            // The dots are 6px in the design; the pseudo-element enlarges the tap target.
            className={cn(
              "relative h-[6px] rounded-full outline-none transition-[width,background-color] duration-300 motion-reduce:transition-none",
              "before:absolute before:-inset-x-[3px] before:-inset-y-2 before:content-['']",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700",
              index === active
                ? "w-4 bg-secondary-700"
                : "w-[6px] bg-pneutral-200 hover:bg-pneutral-400",
            )}
          />
        ))}
      </div>
    </section>
  );
}
