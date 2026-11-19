import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Icon } from "@/components/ui/icon";

/**
 * Empty state — not in the Figma frames. A bordered card in the same style as the doctor
 * cards, with one action that undoes whatever narrowed the search.
 */
export function EmptyResults({
  hasFilters,
  hasQuery,
  onClearFilters,
  onClearSearch,
}: {
  hasFilters: boolean;
  hasQuery: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-pneutral-200 bg-white px-6 py-12 text-center lg:rounded-xsm">
      <span className="flex size-11 items-center justify-center rounded-xsm bg-secondary-100">
        <Icon name="magnifying-glass-outline" />
      </span>
      <h3 className="font-heading text-h6 font-semibold text-pneutral-900">No doctors found</h3>
      <p className="max-w-[40ch] font-paragraph text-typo-md text-pneutral-700">
        We couldn&apos;t find a doctor that matches your search. Try a different name or
        specialty{hasFilters ? ", or remove some filters" : ""}.
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        {hasFilters && (
          <Button variant="outlined" tone="brand" size="sm" shape="responsive" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {hasQuery && (
          <Button variant="outlined" tone="brand" size="sm" shape="responsive" onClick={onClearSearch}>
            Clear search
          </Button>
        )}
      </div>
    </div>
  );
}

/** Error state — not in the Figma frames. Reuses the red "Message" callout from the login flow. */
export function ResultsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Callout tone="error" title="We couldn't load the doctors">
        Something went wrong while contacting the doctor directory. Please try again.
      </Callout>
      <Button variant="outlined" tone="brand" size="sm" shape="responsive" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
