import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type Chip = { key: string; label: string; onRemove: () => void };

/**
 * "Applied Filters" row — Figma 64:4855 (desktop) and the Filters Applied mobile frame
 * 122:16027. A label ("Applied filters:", desktop only), one lavender pill per applied filter
 * with a remove (×) button, and a "Clear Filters" text button. The pills wrap on narrow screens.
 */
export function AppliedFilters({ chips, onClear }: { chips: Chip[]; onClear: () => void }) {
  return (
    <div role="group" aria-label="Applied filters" className="flex flex-wrap items-center gap-2">
      <p className="hidden font-paragraph text-typo-md text-pneutral-700 lg:block">
        Applied filters:
      </p>
      {chips.map((chip) => (
        <span
          key={chip.key}
          // Figma draws the 1px stroke inside the 32px pill: 3px padding + 1px border here.
          className="inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-secondary-100 px-[7px] py-[3px]"
        >
          <span className="font-paragraph text-typo-lg font-medium text-secondary-800">
            {chip.label}
          </span>
          <button
            type="button"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={chip.onRemove}
            className="flex rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary-700"
          >
            <Icon name="x-mark-sm" />
          </button>
        </span>
      ))}
      <Button variant="text" size="md" shape="rounded" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}
