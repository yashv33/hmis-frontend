import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** URL for a page number — pages are real links so they work without JavaScript and can be shared. */
  hrefFor: (page: number) => string;
  className?: string;
};

// 45px tiles (Figma). They can shrink together (aspect-square) so the row still fits below 360px.
const ITEM =
  "flex aspect-square w-full items-center justify-center rounded-xsm border border-pneutral-200 outline-none transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

const TILE = "w-[45px] min-w-0 shrink";

/** 1 … 4 5 6 … 12: always the first, last and current ±1, with gaps collapsed. */
function visiblePages(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/**
 * Figma "Pagination" (330×45): 45px tiles, 12px apart. The arrows use secondary-300, the
 * current page secondary-500 with a secondary-700 border. Hover is derived.
 * The previous/next arrows keep their design colours when there is nowhere to go, but are
 * marked `aria-disabled` and stop being links.
 */
export function Pagination({ page, pageCount, hrefFor, className }: PaginationProps) {
  const arrow = cn(ITEM, "bg-secondary-300");
  return (
    <nav aria-label="Pagination" className={cn("min-w-0", className)}>
      <ul className="flex items-center justify-center gap-3">
        <li className={TILE}>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              scroll={false}
              aria-label="Previous page"
              className={cn(arrow, "hover:bg-secondary-500")}
            >
              <Icon name="arrow-left-micro" />
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Previous page" className={cn(arrow, "cursor-not-allowed")}>
              <Icon name="arrow-left-micro" />
            </span>
          )}
        </li>
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 font-heading text-typo-lg text-pneutral-700">
              …
            </li>
          ) : (
            <li key={item} className={TILE}>
              {item === page ? (
                <span
                  aria-current="page"
                  aria-label={`Page ${item}, current page`}
                  className={cn(
                    ITEM,
                    "border-secondary-700 bg-secondary-500 font-heading text-typo-xl font-semibold text-primary-900",
                  )}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={hrefFor(item)}
                  scroll={false}
                  aria-label={`Page ${item}`}
                  className={cn(
                    ITEM,
                    "bg-white font-heading text-typo-lg text-pneutral-900 hover:bg-secondary-50",
                  )}
                >
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
        <li className={TILE}>
          {page < pageCount ? (
            <Link
              href={hrefFor(page + 1)}
              scroll={false}
              aria-label="Next page"
              className={cn(arrow, "hover:bg-secondary-500")}
            >
              <Icon name="arrow-right-micro" />
            </Link>
          ) : (
            <span aria-disabled="true" aria-label="Next page" className={cn(arrow, "cursor-not-allowed")}>
              <Icon name="arrow-right-micro" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
