import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

// Figma: "Mobile Header" 214:1100 (375×64). The status bar / home indicator in the
// mobile frames are device chrome, so they are not rebuilt here.
// The menu has no drawer design yet, so the button is a placeholder.
type MobileHeaderProps = {
  /** Shows the outlined "Log in" pill next to the menu (visible on the forgot-password screens). */
  showLogin?: boolean;
  /** Logged-in header (Figma 213:527): replaces the right-hand buttons with the account avatar + menu button. */
  actions?: ReactNode;
};

/**
 * Mobile only (below lg). Desktop uses <DesktopHeader />.
 * Sticky: the Figma prototype pins it ("Fixed Header") over the scrolling page.
 */
export function MobileHeader({ showLogin = false, actions }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-2 lg:hidden">
      <Link href="/" aria-label="TiaMeds home">
        <Logo className="h-[34.8px] w-[102px]" />
      </Link>
      <div className="flex items-center gap-2">
        {actions ?? (
          <>
            {showLogin && (
              <Button href="/login" variant="outlined" size="sm" shape="pill">
                Log in
              </Button>
            )}
            <Button
              variant="text"
              size="md"
              shape="pill"
              iconOnly
              icon="bars-3-outline"
              aria-label="Open menu"
            />
          </>
        )}
      </div>
    </header>
  );
}
