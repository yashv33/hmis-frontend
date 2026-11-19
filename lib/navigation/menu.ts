import type { IconName } from "@/components/ui/icon";
import type { Role } from "@/lib/session/mock-user";

/**
 * Where an item is shown: the desktop header nav, the account dropdown, the signed-in mobile
 * menu, the guest mobile menu.
 */
export type Placement = "header" | "account" | "mobile" | "guest-mobile";

export type NavItem = {
  id: string;
  label: string;
  /** Mobile menu wording where the design differs ("Our hospitals" vs "Hospitals"). */
  mobileLabel?: string;
  href: string;
  icon?: IconName;
  placements: Placement[];
  /** Roles that can see the item; omit for everyone. */
  roles?: Role[];
  /**
   * Nested items. The Figma menus have no submenus yet, so nothing renders them — but a
   * child route still marks its parent as active (see `isActive`).
   */
  children?: NavItem[];
  /** Pages that are not designed yet render a placeholder with this title. */
  placeholder?: boolean;
  /** Opens an overlay instead of navigating (the Manage Appointment dialog). */
  action?: "manage-appointment";
};

/**
 * THE menu config (Figma 213:3 + G-01.00). Add, rename or reorder items here and the desktop
 * header, account dropdown, mobile menus and placeholder routes follow. Order = order on screen.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: "my-appointments",
    label: "My Appointments",
    href: "/my-appointments",
    icon: "calendar-outline",
    placements: ["account", "mobile"],
    placeholder: true,
  },
  {
    id: "family-members",
    label: "Family Members",
    href: "/family-members",
    icon: "user-group-outline-muted",
    placements: ["account", "mobile"],
    placeholder: true,
  },
  {
    id: "my-profile",
    label: "My Profile",
    href: "/my-profile",
    icon: "user-outline-sm",
    placements: ["account", "mobile"],
    placeholder: true,
  },
  {
    id: "book-appointment",
    label: "Book appointment",
    href: "/book-appointment",
    placements: ["mobile", "guest-mobile"],
  },
  {
    id: "manage-appointment",
    label: "Manage appointment",
    href: "/manage-appointment",
    placements: ["guest-mobile"],
    action: "manage-appointment",
  },
  {
    id: "find-doctor",
    label: "Find a Doctor",
    mobileLabel: "Find a doctor",
    href: "/find-doctor",
    icon: "magnifying-glass-outline",
    placements: ["header", "mobile", "guest-mobile"],
  },
  {
    id: "specialties",
    label: "Specialties",
    href: "/specialties",
    icon: "heart-outline",
    placements: ["header", "mobile", "guest-mobile"],
    placeholder: true,
  },
  {
    id: "hospitals",
    label: "Hospitals",
    mobileLabel: "Our hospitals",
    href: "/hospitals",
    icon: "building-office-outline",
    placements: ["header", "mobile", "guest-mobile"],
    placeholder: true,
  },
  {
    id: "international-patients",
    label: "International Patients",
    mobileLabel: "International patients",
    href: "/international-patients",
    icon: "globe-alt-outline",
    placements: ["header", "mobile", "guest-mobile"],
    placeholder: true,
  },
];

/** Items for one placement, in config order, filtered by role. */
export function menuFor(placement: Placement, role: Role): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.placements.includes(placement) && (!item.roles || item.roles.includes(role)),
  );
}

export const labelFor = (item: NavItem, placement: Placement) =>
  placement === "mobile" || placement === "guest-mobile"
    ? (item.mobileLabel ?? item.label)
    : item.label;

/** An item is active on its own route, on any route below it, or when a child is active. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return item.children?.some((child) => isActive(child, pathname)) ?? false;
}
