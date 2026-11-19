"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { IconName } from "@/components/ui/icon";
import { useOptionalShell } from "./app-shell";
import type { DialogState } from "./dialogs";

/**
 * A text/card link that opens an overlay (Manage Appointment, Helpline…). Outside the site shell —
 * the login and forgot-password pages render the same access band and help card — it degrades to
 * a plain link to `fallbackHref`.
 */
export function DialogLink({
  dialog,
  fallbackHref,
  className,
  children,
}: {
  dialog: DialogState;
  fallbackHref: string;
  className?: string;
  children: ReactNode;
}) {
  const shell = useOptionalShell();
  if (!shell) {
    return (
      <a href={fallbackHref} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => shell.openDialog(dialog)} className={className}>
      {children}
    </button>
  );
}

type DialogButtonProps = {
  dialog: DialogState;
  fallbackHref: string;
  variant?: "filled" | "outlined" | "text";
  tone?: "secondary" | "brand" | "deep";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "responsive";
  icon?: IconName;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

/** The shared `Button`, wired to open an overlay (falls back to a link outside the shell). */
export function DialogButton({ dialog, fallbackHref, children, ...buttonProps }: DialogButtonProps) {
  const shell = useOptionalShell();
  if (!shell) {
    return (
      <Button href={fallbackHref} {...buttonProps}>
        {children}
      </Button>
    );
  }
  return (
    <Button onClick={() => shell.openDialog(dialog)} {...buttonProps}>
      {children}
    </Button>
  );
}
