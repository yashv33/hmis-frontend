"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { isActive, labelFor, menuFor, type NavItem } from "@/lib/navigation/menu";
import { useSignedIn } from "@/lib/session/auth";
import { MOCK_USER } from "@/lib/session/mock-user";
import { AccountSummary } from "./account-summary";
import { useShell } from "./app-shell";
import { HELPLINE_NUMBER, HELPLINE_TEL } from "./dialogs";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const ROW =
  "flex w-full items-center gap-3 border-b border-pneutral-200 py-5 text-left font-heading text-h5 font-medium outline-none " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-700";

/**
 * Mobile menu overlay — Figma 246:1459 (signed in: account summary card, eight rows, Logout)
 * and 90:2451 (guest: six rows, Log in). A full-screen drawer: logo + close, one 73px row per
 * item (24px Work Sans, chevron at the end) and the footer buttons. Focus is trapped, Esc
 * closes, the page behind can't scroll, and following a link closes it. When the rows are
 * taller than the screen the drawer scrolls with its header pinned.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const signedIn = useSignedIn();
  const { openDialog } = useShell();

  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, { onEscape: onClose });

  if (!open) return null;
  const items = menuFor(signedIn ? "mobile" : "guest-mobile", MOCK_USER.role);
  const placement = signedIn ? "mobile" : "guest-mobile";

  const renderRow = (item: NavItem) => {
    const active = isActive(item, pathname);
    const label = labelFor(item, placement);
    if (item.action === "manage-appointment") {
      return (
        <button
          type="button"
          onClick={() => openDialog({ kind: "manage" })}
          className={cn(ROW, "text-pneutral-900")}
        >
          <span className="min-w-0 flex-1">{label}</span>
          <Icon name="chevron-right" />
        </button>
      );
    }
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onClose}
        // The guest menu (90:2451) draws no current-page colour; the signed-in one keeps it.
        className={cn(ROW, active && signedIn ? "text-primary-800" : "text-pneutral-900")}
      >
        <span className="min-w-0 flex-1">{label}</span>
        <Icon name="chevron-right" />
      </Link>
    );
  };

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-white outline-none lg:hidden"
    >
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between bg-white px-4 py-2">
          <Link href="/" aria-label="TiaMeds home" onClick={onClose}>
            <Logo className="h-[34.8px] w-[102px]" />
          </Link>
          <Button
            variant="text"
            size="md"
            shape="pill"
            iconOnly
            icon="x-mark-outline"
            aria-label="Close menu"
            onClick={onClose}
          />
        </div>

        <nav aria-label="Main menu" className="flex flex-1 flex-col p-4">
          {signedIn && <AccountSummary className="rounded-sm bg-secondary-50 p-4" />}
          <ul>
            {items.map((item) => (
              <li key={item.id}>{renderRow(item)}</li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 flex-col gap-3 px-4 pb-8 pt-4">
          <Button
            variant="outlined"
            tone="secondary"
            shape="pill"
            fullWidth
            onClick={(event) => {
              // Not every browser focuses a button on click; the overlay returns focus to it on close.
              event.currentTarget.focus();
              openDialog(signedIn ? { kind: "logout" } : { kind: "login" });
            }}
          >
            {signedIn ? "Logout" : "Log in"}
          </Button>
          <Button href={HELPLINE_TEL} variant="text" shape="pill" fullWidth icon="phone-outline-md">
            Call {HELPLINE_NUMBER}
          </Button>
        </div>
      </div>
    </div>
  );
}
