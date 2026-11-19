import type { Ref } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type FiltersButtonProps = {
  count: number;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
  /**
   * bar  — desktop "Filters Button" 246:1809: 56px tall, 8px radius, at the end of the search row
   * pill — mobile "Filters Button" 246:2402: 38px pill beside the results count
   */
  variant: "bar" | "pill";
  className?: string;
  ref?: Ref<HTMLButtonElement>;
};

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

/** Toggles the filter panel. The count badge is the number of filters applied. */
export function FiltersButton({
  count,
  expanded,
  controls,
  onToggle,
  variant,
  className,
  ref,
}: FiltersButtonProps) {
  const isBar = variant === "bar";
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={expanded}
      aria-haspopup="dialog"
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 border border-pneutral-300 bg-white transition-colors duration-150 hover:border-pneutral-500 hover:bg-secondary-50 aria-expanded:border-secondary-700 aria-expanded:bg-secondary-50",
        // Figma "Filters Button" with filters applied: lavender fill, secondary-700 border.
        isBar && count > 0 && "border-secondary-700 bg-secondary-50",
        isBar
          ? "h-14 min-w-[133px] justify-center rounded-xsm p-4 font-paragraph text-typo-md font-semibold text-pneutral-900"
          : "h-[38px] rounded-full py-2 pl-3 pr-4 font-heading text-typo-md font-medium text-pneutral-900",
        FOCUS,
        className,
      )}
    >
      <Icon name={isBar ? "filters" : "filters-sm"} />
      Filters
      <Badge count={count} variant={isBar ? "round" : "pill"} />
      {count > 0 && <span className="sr-only">, {count} applied</span>}
    </button>
  );
}
