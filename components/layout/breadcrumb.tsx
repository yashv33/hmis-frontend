import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Container } from "./container";

export type Crumb = { label: string; href?: string };

const CHIP = "flex h-8 items-center gap-2 rounded-xsm px-2 py-[6px] font-paragraph text-typo-md text-pneutral-900";

/**
 * Figma "Breadcrumb Row" 283:155492 — desktop only (the mobile frames have none).
 * The last item is the current page.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden bg-white lg:block">
      <Container>
        {/* 8 + 32 + 7 + 1px border = 48px: Figma draws the border inside the row. */}
        <ol className="flex items-center border-b border-[rgba(28,28,28,0.1)] px-8 pb-[7px] pt-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label}>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={`${CHIP} outline-none transition-colors hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-secondary-700`}
                  >
                    {item.label}
                    <Icon name="chevron-right-breadcrumb" />
                  </Link>
                ) : (
                  <span aria-current="page" className={CHIP}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
