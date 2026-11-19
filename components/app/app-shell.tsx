"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DialogHost, type DialogState } from "./dialogs";
import { MobileMenu } from "./mobile-menu";

type ShellApi = {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  /** Opens one of the overlays (dialog on desktop, bottom sheet on mobile). */
  openDialog: (dialog: DialogState) => void;
  closeDialog: () => void;
  /** Opens the "Log out?" confirmation. */
  openLogout: () => void;
};

const ShellContext = createContext<ShellApi | null>(null);

export function useShell(): ShellApi {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error("useShell must be used inside <AppShellProvider>");
  return shell;
}

/** For controls that also render outside the shell (login, forgot-password pages). */
export const useOptionalShell = (): ShellApi | null => useContext(ShellContext);

/** Same breakpoint as the layout: the mobile menu only exists below `lg`. */
const DESKTOP = "(min-width: 1024px)";

/**
 * State for everything the header can open: the mobile menu drawer and the overlays (logout,
 * log in, helpline, call for assistance, manage appointment). They close on a route change;
 * the drawer also closes if the window grows to the desktop layout. The overlays are rendered
 * here, after the page.
 */
export function AppShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  // Close on route change (state adjusted during render, not in an effect).
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setMenuOpen(false);
    setDialog(null);
  }

  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openDialog = useCallback((next: DialogState) => setDialog(next), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const openLogout = useCallback(() => setDialog({ kind: "logout" }), []);

  const api = useMemo(
    () => ({ menuOpen, openMenu, closeMenu, openDialog, closeDialog, openLogout }),
    [menuOpen, openMenu, closeMenu, openDialog, closeDialog, openLogout],
  );

  return (
    <ShellContext value={api}>
      {children}
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <DialogHost dialog={dialog} onClose={closeDialog} open={openDialog} />
    </ShellContext>
  );
}
