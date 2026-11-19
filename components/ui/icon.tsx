import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Icons exported from Figma (public/icons/*.svg). Each SVG carries its own
 * colour and root width/height, so we render it at its intrinsic size — the
 * value here must match the SVG root.
 */
const ICON_SIZES = {
  "access-book": 22,
  "access-helpline": 22,
  "access-manage": 22,
  "access-whatsapp": 22,
  "account-chevron": 16,
  "alert-md": 20,
  "alert-sm": 16,
  "arrow-left-micro": 24,
  "arrow-path-hero": 40,
  "arrow-path-outline": 20,
  "arrow-right": 16,
  "arrow-right-micro": 24,
  "arrow-right-outline": 20,
  "arrow-right-outline-lg": 24,
  "avatar-placeholder-lg": 76,
  "avatar-user": 26,
  "avatar-user-md": 40,
  "bars-3-outline": 20,
  "briefcase-outline": 16,
  "briefcase-outline-md": 20,
  "building-office-note": 20,
  "building-office-outline": 20,
  "building-office-trust": 32,
  "calendar-field": 24,
  "calendar-hero": 40,
  "calendar-next": 16,
  "calendar-outline": 20,
  "calendar-outline-sm": 16,
  "calendar-prev": 16,
  "calendar-trust": 32,
  "chat-bubble-left-ellipsis-outline": 20,
  "check-circle-micro": 24,
  "check-circle-sm": 20,
  "check-circle-success": 40,
  "check-circle-success-sm": 32,
  "chevron-right": 20,
  "chevron-right-breadcrumb": 18,
  "chevron-right-lg": 24,
  "chevron-right-sm": 18,
  "clock-outline": 20,
  "clock-sm": 16,
  date: 14,
  "envelope-outline": 16,
  "envelope-solid": 20,
  "exclamation-circle-outline": 16,
  "exclamation-triangle-solid": 20,
  experience: 14,
  "eye-outline": 24,
  // Not in Figma: the "password visible" counterpart of eye-outline (same icon family).
  "eye-slash-outline": 24,
  facebook: 24,
  filters: 20,
  "filters-sm": 18,
  "globe-alt-outline": 20,
  "globe-alt-outline-md": 16,
  "grid-view-selected": 20,
  "heart-outline": 20,
  "help-tile": 22,
  "hospital-building": 22,
  "hospital-building-sm": 20,
  languages: 14,
  linkedin: 24,
  "list-view": 20,
  "loading-ring": 107,
  "location-on": 20,
  "location-sm": 16,
  "lock-closed-outline": 24,
  "login-md": 24,
  "logout-md": 24,
  "logout-sm": 20,
  "magnifying-glass-mini": 16,
  "magnifying-glass-mini-md": 20,
  "magnifying-glass-mini-xl": 24,
  "magnifying-glass-outline": 20,
  "magnifying-glass-outline-xl": 24,
  "phone-lg": 24,
  "phone-note": 14,
  "phone-outline": 16,
  "phone-outline-lg": 24,
  "phone-outline-md": 20,
  "phone-solid": 20,
  "radio-off": 24,
  "radio-on": 24,
  "select-chevron": 24,
  "shield-check-brand": 20,
  "shield-check-outline": 16,
  "shield-check-sm": 16,
  "shield-check-trust": 32,
  "sort-chevron": 16,
  "specialty-cardiology": 20,
  "specialty-dermatology": 20,
  "specialty-general-medicine": 20,
  "specialty-hematology": 20,
  "specialty-neurology": 20,
  "specialty-ophthalmology": 20,
  "specialty-orthopaedics": 20,
  "specialty-paediatrics": 20,
  "status-dot": 8,
  "step-check": 14,
  "today-indicator": 8,
  "user-circle-solid": 20,
  "user-group-outline": 20,
  "user-group-sm": 16,
  "user-group-outline-muted": 20,
  "user-group-trust": 32,
  "user-outline": 24,
  "user-outline-sm": 20,
  x: 24,
  "x-mark-outline": 20,
  "x-mark-sm": 16,
} as const;

export type IconName = keyof typeof ICON_SIZES;

/**
 * Figma recolours these per use (white on a purple button, brand purple on the
 * outlined button, green for a completed OTP) but exports them in the master's
 * dark colour (the grid/list view toggle icons swap between selected and idle
 * colours the same way). They are drawn as a CSS mask of the exact exported SVG, so the
 * colour comes from the surrounding `text-*` colour instead.
 */
const TINTED: ReadonlySet<IconName> = new Set<IconName>([
  // Exported dark (#1E1E1D) but drawn white/pneutral-50 on every filled button that uses them.
  "arrow-right-outline",
  "arrow-right-outline-lg",
  "chat-bubble-left-ellipsis-outline",
  "check-circle-micro",
  "grid-view-selected",
  "list-view",
  "magnifying-glass-outline-xl",
  "phone-outline-md",
  "user-circle-solid",
]);

type IconProps = {
  name: IconName;
  className?: string;
};

/** Decorative icon. Put the accessible name on the control that contains it. */
export function Icon({ name, className }: IconProps) {
  const size = ICON_SIZES[name];
  const src = `/icons/${name}.svg`;

  if (TINTED.has(name)) {
    const mask = `url(${src})`;
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block shrink-0 bg-current", className)}
        style={{
          width: size,
          height: size,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      // Icons are a few hundred bytes; lazy loading only makes them pop in while scrolling.
      loading="eager"
      className={cn("shrink-0", className)}
    />
  );
}
