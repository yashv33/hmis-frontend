import type { ReactNode } from "react";
import { DoctorAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  doctorSubtitle,
  doctorTitle,
  experienceLabel,
} from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";

export type DoctorActions = {
  /** No profile screen is designed yet — the page passes a placeholder handler. */
  onViewProfile: (doctor: Doctor) => void;
  /** Booking entry point: "View Availability" starts the booking flow for this doctor. */
  onViewAvailability: (doctor: Doctor) => void;
  /** "Call for Assistance" (doctors without online booking) opens the assistance overlay. */
  onCallForAssistance: (doctor: Doctor) => void;
};

type DoctorCardProps = DoctorActions & {
  doctor: Doctor;
  className?: string;
};

/**
 * Figma "Dr. … Card" — desktop 246:1830 (282px column, 8px radius, stacked) and mobile
 * 246:2409 (full width, 16px radius, photo beside the name). One grid is re-flowed with
 * `lg:` classes; the pieces that differ in content (icons, availability copy) are
 * swapped with `lg:hidden` / `hidden lg:*`.
 */
export function DoctorCard({
  doctor,
  onViewProfile,
  onViewAvailability,
  onCallForAssistance,
  className,
}: DoctorCardProps) {
  const slot = doctor.nextAvailable;
  const nameId = `doctor-${doctor.id}-name`;

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "grid grid-cols-[4rem_minmax(0,1fr)] content-start gap-x-3 gap-y-3 rounded-lg border border-pneutral-200 bg-white p-4",
        "lg:grid-cols-1 lg:gap-y-0 lg:rounded-xsm lg:p-5",
        className,
      )}
    >
      <DoctorAvatar
        name={doctor.name}
        src={doctor.photo}
        className="col-start-1 row-start-1 size-16 lg:size-[72px]"
      />

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-1 lg:col-start-1 lg:row-start-2 lg:mt-4 lg:gap-2">
        <h3
          id={nameId}
          className="font-heading text-typo-lg font-semibold text-pneutral-900"
        >
          {doctorTitle(doctor)}
        </h3>
        {/* Two lines on desktop in every design card, so the rows below line up across a row. */}
        <p className="font-heading text-typo-sm text-pneutral-700 lg:min-h-10 lg:font-paragraph lg:text-typo-md">
          {doctorSubtitle(doctor)}
        </p>
      </div>

      <ul className="col-span-2 flex flex-col gap-1 lg:col-span-1 lg:mt-2 lg:gap-2">
        <MetaRow
          mobileIcon="briefcase-outline"
          desktopIcon="experience"
          text={experienceLabel(doctor)}
        />
        <MetaRow
          mobileIcon="globe-alt-outline-md"
          desktopIcon="languages"
          text={doctor.languages.join(", ")}
        />
      </ul>

      {slot ? (
        <AvailabilityBox
          className="col-span-2 lg:col-span-1 lg:mt-4"
          icon={
            <>
              <Icon name="status-dot" className="lg:hidden" />
              {slot.icon === "dot" ? (
                <Icon name="today-indicator" className="hidden lg:block" />
              ) : (
                <Icon name="date" className="hidden lg:block" />
              )}
            </>
          }
          label="Next available"
          value={slot.label}
        />
      ) : (
        <>
          {/* Mobile shows a plain sentence, desktop the same box as the other cards. */}
          <p className="col-span-2 font-heading text-typo-sm text-pneutral-700 lg:hidden">
            Online booking isn&apos;t available for this doctor. Our team can book for you.
          </p>
          <AvailabilityBox
            className="col-span-2 hidden lg:col-span-1 lg:mt-4 lg:flex"
            icon={<Icon name="phone-note" />}
            label="Online booking not available"
            value="Call us to book a time"
          />
        </>
      )}

      <div className="col-span-2 flex items-center gap-2 lg:col-span-1 lg:mt-4 lg:flex-col lg:items-stretch lg:gap-4">
        {/* Mobile: 126px text pill beside the main action; doctors without online booking only
            offer "Call" there (as in the design). Desktop: "View Profile →" link above a
            full-width button. The span only exists to hide the pill on mobile. */}
        <span className={slot ? "contents" : "hidden lg:contents"}>
          <Button
            variant="text"
            size="md"
            shape="pill"
            aria-label={`View profile of ${doctor.name}`}
            onClick={() => onViewProfile(doctor)}
            iconRight={<Icon name="arrow-right" className="hidden lg:block" />}
            className="w-[126px] lg:h-5 lg:w-fit lg:min-w-0 lg:self-start lg:rounded-xsm lg:px-0 lg:font-paragraph lg:text-typo-md lg:font-semibold lg:gap-1 lg:hover:bg-transparent lg:hover:underline"
          >
            View Profile
          </Button>
        </span>

        {slot ? (
          <Button
            shape="responsive"
            aria-label={`View availability of ${doctor.name}`}
            onClick={() => onViewAvailability(doctor)}
            className="flex-1 lg:w-full lg:flex-none"
          >
            View Availability
          </Button>
        ) : (
          <Button
            variant="outlined"
            tone="secondary"
            shape="responsive"
            icon="phone-outline-md"
            onClick={(event) => {
              // The overlay hands focus back to this button when it closes.
              event.currentTarget.focus();
              onCallForAssistance(doctor);
            }}
            className="flex-1 lg:w-full lg:flex-none lg:border-primary-800 lg:text-primary-800 lg:hover:bg-secondary-100"
          >
            Call for Assistance
          </Button>
        )}
      </div>
    </article>
  );
}

function MetaRow({
  mobileIcon,
  desktopIcon,
  text,
}: {
  mobileIcon: "briefcase-outline" | "globe-alt-outline-md";
  desktopIcon: "experience" | "languages";
  text: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <Icon name={mobileIcon} className="lg:hidden" />
      <Icon name={desktopIcon} className="hidden lg:block" />
      <span className="min-w-0 font-heading text-typo-sm text-pneutral-700 lg:font-paragraph">
        {text}
      </span>
    </li>
  );
}

/**
 * Grey "Availability Row": a status icon, a small label and the value in semibold.
 * Mobile puts label and value on one line (value right-aligned); desktop stacks them.
 */
function AvailabilityBox({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xsm bg-pneutral-50 px-3 py-2 lg:items-start lg:rounded-[4px]",
        className,
      )}
    >
      {icon}
      <p className="flex min-w-0 flex-1 items-center justify-between gap-2 font-heading text-typo-sm lg:flex-col lg:items-start lg:justify-start lg:gap-0 lg:font-paragraph">
        <span className="text-pneutral-700">{label}</span>
        <span className="text-right font-semibold text-pneutral-900 lg:text-left">{value}</span>
      </p>
    </div>
  );
}

/**
 * List view (desktop only, not in the Figma frames): the same content laid out as one
 * wide row per doctor. Below lg the page always shows the compact mobile card.
 */
export function DoctorRow({
  doctor,
  onViewProfile,
  onViewAvailability,
  onCallForAssistance,
  className,
}: DoctorCardProps) {
  const slot = doctor.nextAvailable;
  const nameId = `doctor-${doctor.id}-row-name`;
  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "items-center gap-6 rounded-xsm border border-pneutral-200 bg-white p-5",
        className,
      )}
    >
      <DoctorAvatar name={doctor.name} src={doctor.photo} className="size-[72px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 id={nameId} className="font-heading text-typo-lg font-semibold text-pneutral-900">
          {doctorTitle(doctor)}
        </h3>
        <p className="font-paragraph text-typo-md text-pneutral-700">{doctorSubtitle(doctor)}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li className="flex items-center gap-2 font-paragraph text-typo-sm text-pneutral-700">
            <Icon name="experience" />
            {experienceLabel(doctor)}
          </li>
          <li className="flex items-center gap-2 font-paragraph text-typo-sm text-pneutral-700">
            <Icon name="languages" />
            {doctor.languages.join(", ")}
          </li>
        </ul>
      </div>
      <AvailabilityBox
        className="w-[210px] shrink-0"
        icon={
          slot ? (
            <Icon name={slot.icon === "dot" ? "today-indicator" : "date"} />
          ) : (
            <Icon name="phone-note" />
          )
        }
        label={slot ? "Next available" : "Online booking not available"}
        value={slot ? slot.label : "Call us to book a time"}
      />
      <div className="flex w-[200px] shrink-0 flex-col items-stretch gap-3">
        <Button
          variant="text"
          size="md"
          aria-label={`View profile of ${doctor.name}`}
          onClick={() => onViewProfile(doctor)}
          iconRight={<Icon name="arrow-right" />}
          className="w-fit self-start lg:h-5 lg:min-w-0 lg:px-0 lg:gap-1 lg:font-paragraph lg:text-typo-md lg:font-semibold lg:hover:bg-transparent lg:hover:underline"
        >
          View Profile
        </Button>
        {slot ? (
          <Button
            aria-label={`View availability of ${doctor.name}`}
            onClick={() => onViewAvailability(doctor)}
            className="w-full"
          >
            View Availability
          </Button>
        ) : (
          <Button
            variant="outlined"
            tone="brand"
            icon="phone-outline-md"
            onClick={(event) => {
              event.currentTarget.focus();
              onCallForAssistance(doctor);
            }}
            className="w-full"
          >
            Call for Assistance
          </Button>
        )}
      </div>
    </article>
  );
}

/** Placeholder with the same box sizes as the card while results load. */
export function DoctorCardSkeleton({ className }: { className?: string }) {
  const bar = "rounded-[4px] bg-pneutral-200";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid animate-pulse grid-cols-[4rem_minmax(0,1fr)] content-start gap-x-3 gap-y-3 rounded-lg border border-pneutral-200 bg-white p-4 motion-reduce:animate-none",
        "lg:grid-cols-1 lg:gap-y-0 lg:rounded-xsm lg:p-5",
        className,
      )}
    >
      <div className="col-start-1 row-start-1 size-16 rounded-sm bg-secondary-100 lg:size-[72px] lg:rounded-[4px]" />
      <div className="col-start-2 row-start-1 flex flex-col gap-2 lg:col-start-1 lg:row-start-2 lg:mt-4">
        <div className={cn(bar, "h-6 w-4/5")} />
        <div className={cn(bar, "h-[18px] w-full lg:h-10")} />
      </div>
      <div className="col-span-2 flex flex-col gap-1 lg:col-span-1 lg:mt-2 lg:gap-2">
        <div className={cn(bar, "h-[18px] w-1/3")} />
        <div className={cn(bar, "h-[18px] w-1/2")} />
      </div>
      <div className="col-span-2 h-[34px] rounded-xsm bg-pneutral-50 lg:col-span-1 lg:mt-4 lg:h-[52px] lg:rounded-[4px]" />
      <div className="col-span-2 flex gap-2 lg:col-span-1 lg:mt-4 lg:flex-col lg:gap-4">
        <div className={cn(bar, "h-12 w-[126px] rounded-full lg:h-5 lg:w-24")} />
        <div className="h-12 flex-1 rounded-full bg-pneutral-200 lg:rounded-xsm" />
      </div>
    </div>
  );
}
