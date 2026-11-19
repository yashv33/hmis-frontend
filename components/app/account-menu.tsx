"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AccountAvatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { isActive, menuFor } from "@/lib/navigation/menu";
import { MOCK_USER } from "@/lib/session/mock-user";
import { AccountSummary } from "./account-summary";
import { useShell } from "./app-shell";

const ITEM =
  "flex w-full items-center gap-3 rounded-xsm p-3 text-left font-paragraph text-typo-md outline-none transition-colors duration-150 " +
  "hover:bg-secondary-50 focus-visible:bg-secondary-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-700";

/**
 * Desktop account dropdown — Figma "Account Menu Trigger" 213:513 + "Account Menu" 246:1430.
 * The 66×34 pill opens a 280px panel (right-aligned to the pill, 29px below it) with the
 * account summary, My Appointments / Family Members / My Profile and a red Logout.
 *
 * Closes on outside click, Esc (focus returns to the trigger), Tab, a route change, or
 * choosing an item. Arrow keys / Home / End move between the items. The Figma scrim for
 * this overlay is fully transparent, so it is just the outside-click handling.
 */
export function AccountMenu() {
  const { openLogout } = useShell();
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const items = menuFor("account", MOCK_USER.role);

  const menuItems = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const closeAndReturnFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) menuItems()[0]?.focus();
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const entries = menuItems();
    const index = entries.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => entries[(i + entries.length) % entries.length]?.focus();
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        closeAndReturnFocus();
        break;
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(entries.length - 1);
        break;
      case "Tab":
        // Let Tab move on from the trigger, as for any closed menu button.
        closeAndReturnFocus();
        break;
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" && !open) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const logout = () => {
    closeAndReturnFocus(); // the dialog hands focus back here when it closes
    openLogout();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-2 rounded-full border border-pneutral-200 bg-white py-1 pl-1 pr-3 outline-none transition-colors duration-150 hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700 aria-expanded:bg-secondary-50"
      >
        <AccountAvatar />
        <Icon name="account-chevron" />
      </button>

      {open && (
        <div
          id={menuId}
          onKeyDown={onKeyDown}
          className="absolute right-0 top-[calc(100%+29px)] z-50 flex w-[280px] flex-col gap-1 rounded-sm border border-pneutral-200 bg-white p-2 shadow-soft"
        >
          <AccountSummary className="p-3" />
          <div role="separator" className="h-px bg-pneutral-200" />
          <div ref={listRef} role="menu" aria-label="Account" className="flex flex-col gap-1">
            {items.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(ITEM, "text-pneutral-900", active && "bg-secondary-50")}
                >
                  {item.icon && <Icon name={item.icon} />}
                  {item.label}
                </Link>
              );
            })}
            <div role="separator" className="h-px bg-pneutral-200" />
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={logout}
              className={cn(ITEM, "text-warning-600")}
            >
              <Icon name="logout-sm" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
