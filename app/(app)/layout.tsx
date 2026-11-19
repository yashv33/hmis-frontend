import type { ReactNode } from "react";
import { SiteShell } from "@/components/app/site-chrome";

/**
 * AppLayout — wraps the public and signed-in pages (the `(app)` route group; the group name is not
 * part of the URL): header + menus + `<main>` + footers, with the guest or the account variant
 * chosen from the mock session. See `components/app/site-chrome.tsx`.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
