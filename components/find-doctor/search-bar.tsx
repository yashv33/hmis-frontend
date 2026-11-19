import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Desktop only: the "Filters" button that sits at the end of the row. */
  children?: ReactNode;
  /** The desktop filters popover; positioned against the row (8px below it, right-aligned). */
  panel?: ReactNode;
};

/**
 * Figma "Search Row" 246:1806 (desktop: 56px field + Search button + Filters) and
 * "Search Field" 246:2400 (mobile: 48px field only — the mobile frame has no Search
 * button, so the keyboard's search key submits).
 *
 * The two frames use different placeholder copy, so the visible hint is drawn from two
 * spans that show while the (blank) native placeholder is shown; the input itself is
 * named by its label.
 */
export function SearchBar({ value, onChange, onSubmit, children, panel }: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="relative flex items-center gap-4">
      <form
        role="search"
        aria-label="Doctors"
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        {/* Figma strokes sit inside the box, CSS borders add to it → padding minus border. */}
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xsm border-[1.5px] border-sneutral-100 bg-white px-[calc(1rem-1.5px)] transition-[border-color,box-shadow] duration-150 hover:border-pneutral-300 focus-within:border-secondary-300 focus-within:shadow-[0_0_0_2px_var(--color-secondary-700)] focus-within:hover:border-secondary-300 lg:h-14 lg:border-[2.5px] lg:px-[calc(1.25rem-2.5px)]">
          <Icon name="magnifying-glass-mini-md" className="lg:hidden" />
          <Icon name="magnifying-glass-mini-xl" className="hidden lg:block" />
          <div className="relative h-full min-w-0 flex-1">
            <label htmlFor="doctor-search" className="sr-only">
              Search doctors by name, specialty, condition or hospital
            </label>
            <input
              id="doctor-search"
              name="q"
              type="search"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder=" "
              autoComplete="off"
              enterKeyHint="search"
              className="peer h-full w-full min-w-0 bg-transparent font-heading text-typo-md text-pneutral-900 outline-none lg:text-typo-lg [&::-webkit-search-cancel-button]:appearance-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center truncate font-heading text-typo-md text-pneutral-300 peer-placeholder-shown:flex lg:peer-placeholder-shown:hidden"
            >
              Doctor, specialty or symptom
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center truncate font-heading text-typo-lg text-pneutral-300 lg:peer-placeholder-shown:flex"
            >
              Search by name, specialty, condition or hospital…
            </span>
          </div>
        </div>
        <div className="hidden lg:block">
          <Button type="submit" size="lg" icon="magnifying-glass-outline-xl" className="w-[133px]">
            Search
          </Button>
        </div>
      </form>
      {children}
      {panel}
    </div>
  );
}
