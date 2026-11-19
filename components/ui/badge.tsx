import { cn } from "@/lib/cn";

type BadgeProps = {
  count: number;
  /**
   * round — 20px circle in secondary-800, Noto Sans (desktop "Filters Count Badge")
   * pill  — 18px pill in primary-800, Work Sans (mobile "Filters Count Badge")
   */
  variant?: "round" | "pill";
  className?: string;
};

/** Small count bubble, e.g. the number of active filters. Decorative: the parent names it. */
export function Badge({ count, variant = "round", className }: BadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-typo-sm font-semibold text-white",
        variant === "round"
          ? "size-5 bg-secondary-800 font-paragraph"
          : "h-[18px] bg-primary-800 px-2 font-heading",
        className,
      )}
    >
      {count}
    </span>
  );
}
