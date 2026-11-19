"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isActive, labelFor, menuFor } from "@/lib/navigation/menu";
import { MOCK_USER } from "@/lib/session/mock-user";

/**
 * Header nav buttons (Figma 213:462 "Frame 54") driven by the menu config. The current
 * route is always marked with `aria-current="page"`. The signed-in shell also fills it with
 * lavender (the shell brief asks for an active state the design doesn't draw, so this reuses
 * the hover colour); the guest header is drawn without one in every guest frame, so it
 * stays unfilled there.
 */
export function PrimaryNavItems({ highlightActive = false }: { highlightActive?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {menuFor("header", MOCK_USER.role).map((item) => (
        <Button
          key={item.id}
          href={item.href}
          variant="text"
          size="md"
          icon={item.icon}
          aria-current={isActive(item, pathname) ? "page" : undefined}
          className={cn(highlightActive && "aria-[current=page]:bg-secondary-50")}
        >
          {labelFor(item, "header")}
        </Button>
      ))}
    </>
  );
}
