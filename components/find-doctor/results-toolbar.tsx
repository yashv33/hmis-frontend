import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { SearchResult } from "@/lib/find-doctor/mock-api";
import { SORT_OPTIONS, type SortKey, type ViewMode } from "@/lib/find-doctor/query";

type CountState = {
  /** Result of the latest request, or null while loading / after an error. */
  result: SearchResult | null;
  loading: boolean;
};

const stateText = ({ result, loading }: CountState) => {
  if (loading) return "Loading doctors…";
  if (!result) return "Doctors unavailable";
  if (result.total === 0) return "No doctors found";
  return null;
};

const range = (result: SearchResult) =>
  result.from === result.to ? String(result.from) : `${result.from}–${result.to}`;

/**
 * "Results Count" 246:1818 (desktop): "Displaying 1–6 out of 24" with the numbers in
 * semibold secondary-800. `role="status"` announces changes politely to screen readers.
 */
export function DesktopResultsCount(props: CountState) {
  const text = stateText(props);
  return (
    <p
      role="status"
      className="hidden font-paragraph text-typo-md text-pneutral-900 lg:block"
    >
      {text ?? (
        <>
          Displaying <b className="font-semibold text-secondary-800">{range(props.result!)}</b> out of{" "}
          <b className="font-semibold text-secondary-800">{props.result!.total}</b>
        </>
      )}
    </p>
  );
}

/** "Results Count" 246:2407 (mobile): right-aligned in the toolbar beside the Filters pill. */
export function MobileResultsCount(props: CountState) {
  const text = stateText(props);
  return (
    <p
      role="status"
      className="min-w-0 flex-1 text-right font-heading text-typo-sm text-pneutral-700 lg:hidden"
    >
      {text ?? `Displaying ${range(props.result!)} out of ${props.result!.total}`}
    </p>
  );
}

type SortSelectProps = {
  value: SortKey;
  onChange: (value: SortKey) => void;
};

/**
 * Figma "Sort Dropdown" 246:1820. The visible box reads "Sort by: <choice>"; a transparent
 * native `<select>` lies over it so the options, keyboard handling and screen-reader
 * semantics are the browser's own.
 */
function SortSelect({ value, onChange }: SortSelectProps) {
  const current = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];
  return (
    <div className="relative flex items-center gap-2 rounded-xsm border border-pneutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary-700 hover:border-pneutral-500">
      <span className="font-paragraph text-typo-md text-pneutral-900">Sort by: {current.label}</span>
      <Icon name="sort-chevron" />
      <select
        aria-label="Sort by"
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const VIEWS: { value: ViewMode; label: string; icon: "grid-view-selected" | "list-view" }[] = [
  { value: "grid", label: "Grid view", icon: "grid-view-selected" },
  { value: "list", label: "List view", icon: "list-view" },
];

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div
      role="group"
      aria-label="Results layout"
      className="flex gap-1 rounded-xsm border border-pneutral-300 bg-white p-1"
    >
      {VIEWS.map((view) => {
        const selected = view.value === value;
        return (
          <button
            key={view.value}
            type="button"
            aria-label={view.label}
            aria-pressed={selected}
            onClick={() => onChange(view.value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-[4px] outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary-700",
              selected
                ? "bg-secondary-100 text-secondary-800"
                : "text-pneutral-700 hover:bg-secondary-50",
            )}
          >
            <Icon name={view.icon} />
          </button>
        );
      })}
    </div>
  );
}

type ResultsToolbarProps = CountState & {
  sort: SortKey;
  view: ViewMode;
  onSortChange: (sort: SortKey) => void;
  onViewChange: (view: ViewMode) => void;
};

/** "Results Toolbar" 246:1817 — desktop only (the mobile toolbar lives in the page header). */
export function ResultsToolbar({
  result,
  loading,
  sort,
  view,
  onSortChange,
  onViewChange,
}: ResultsToolbarProps) {
  return (
    <div className="hidden items-center justify-between lg:flex">
      <DesktopResultsCount result={result} loading={loading} />
      <div className="flex items-center gap-3">
        <SortSelect value={sort} onChange={onSortChange} />
        <ViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  );
}
