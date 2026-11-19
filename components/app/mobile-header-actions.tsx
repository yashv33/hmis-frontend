"use client";

import { AccountAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useShell } from "./app-shell";

/**
 * Right side of the mobile header: the menu button, preceded by the account avatar when signed in
 * (Figma 213:549) or by the outlined "Log in" pill for guests (Figma 184:77617, opens the Log in
 * overlay).
 */
export function MobileHeaderActions({ guest = false }: { guest?: boolean }) {
  const { menuOpen, openMenu, openDialog } = useShell();
  return (
    <>
      {guest ? (
        <Button
          variant="outlined"
          size="sm"
          shape="pill"
          onClick={() => openDialog({ kind: "login" })}
        >
          Log in
        </Button>
      ) : (
        <span role="img" aria-label="Signed-in account" className="flex">
          <AccountAvatar />
        </span>
      )}
      <Button
        variant="text"
        size="md"
        shape="pill"
        iconOnly
        icon="bars-3-outline"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={openMenu}
      />
    </>
  );
}

/** Desktop "Login" button in the guest header's 108px slot (opens the Log in overlay). */
export function GuestLoginButton() {
  const { openDialog } = useShell();
  return (
    <Button size="md" icon="user-circle-solid" onClick={() => openDialog({ kind: "login" })}>
      Login
    </Button>
  );
}
