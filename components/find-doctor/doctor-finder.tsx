"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useOptionalShell } from "@/components/app/app-shell";
import { HelpSection } from "@/components/layout/help-section";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/cn";
import { hospitalName } from "@/lib/find-doctor/doctors";
import { countDoctors, type SearchResult } from "@/lib/find-doctor/mock-api";
import {
  DEFAULT_QUERY,
  PAGE_SIZE,
  activeFilterCount,
  clearFilters,
  parseQuery,
  serializeQuery,
  type DoctorQuery,
} from "@/lib/find-doctor/query";
import type { Doctor } from "@/lib/find-doctor/types";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { AppliedFilters } from "./applied-filters";
import { DoctorCard, DoctorCardSkeleton, DoctorRow } from "./doctor-card";
import { FiltersPopover, FiltersSheet, type FilterDraft } from "./filters-panel";
import { FiltersButton } from "./filters-button";
import { EmptyResults, ResultsError } from "./results-states";
import { MobileResultsCount, ResultsToolbar } from "./results-toolbar";
import { SearchBar } from "./search-bar";
import { useDoctorResults } from "./use-doctor-results";

const FILTERS_PANEL_ID = "doctor-filters";

type ViewProps = {
  query: DoctorQuery;
  /** Text in the search box (applied on submit). */
  draft: string;
  onDraftChange: (value: string) => void;
  onSearch: () => void;
  onSortChange: (sort: DoctorQuery["sort"]) => void;
  onViewChange: (view: DoctorQuery["view"]) => void;
  /** Filters panel: staged selection, open state and its actions. */
  filterDraft: FilterDraft;
  onFilterDraftChange: (draft: FilterDraft) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  onApplyFilters: () => void;
  onClearFilterDraft: () => void;
  onCloseFilters: () => void;
  filtersButtonRef?: RefObject<HTMLButtonElement | null>;
  /** "Applied filters" row. */
  onRemoveSpecialty: () => void;
  onRemoveHospital: () => void;
  onClearApplied: () => void;
  onClearSearch: () => void;
  loading: boolean;
  failed: boolean;
  result: SearchResult | null;
  onRetry: () => void;
  hrefForPage: (page: number) => string;
  onViewProfile: (doctor: Doctor) => void;
  onViewAvailability: (doctor: Doctor) => void;
  onCallForAssistance: (doctor: Doctor) => void;
  resultsRef?: RefObject<HTMLElement | null>;
  rail: ReactNode;
};

/**
 * The whole Find a Doctor screen below the breadcrumb, as a pure view: the lavender header
 * band (title, search, filters, applied filters), the results column (toolbar, cards,
 * pagination) with the desktop right rail, and the mobile help section. `DoctorFinder` wires it
 * to the URL; `DoctorFinderFallback` renders the same layout in its loading state while the
 * page hydrates.
 */
function FinderView(props: ViewProps) {
  const {
    query,
    draft,
    onDraftChange,
    onSearch,
    onSortChange,
    onViewChange,
    filterDraft,
    onFilterDraftChange,
    filtersOpen,
    onToggleFilters,
    onApplyFilters,
    onClearFilterDraft,
    onCloseFilters,
    filtersButtonRef,
    onRemoveSpecialty,
    onRemoveHospital,
    onClearApplied,
    onClearSearch,
    loading,
    failed,
    result,
    onRetry,
    hrefForPage,
    onViewProfile,
    onViewAvailability,
    onCallForAssistance,
    resultsRef,
    rail,
  } = props;
  const isDesktop = useIsDesktop();
  const filterCount = activeFilterCount(query);
  const countState = { result, loading };
  const doctors = result?.doctors ?? [];
  const isList = query.view === "list";
  const matchCount = countDoctors({
    q: query.q,
    specialty: filterDraft.specialty,
    hospital: filterDraft.hospital,
  });
  const panelProps = {
    draft: filterDraft,
    onDraftChange: onFilterDraftChange,
    matchCount,
    onApply: onApplyFilters,
    onClear: onClearFilterDraft,
    onClose: onCloseFilters,
  };
  const chips = [
    query.specialty && { key: "specialty", label: query.specialty, onRemove: onRemoveSpecialty },
    query.hospital && {
      key: "hospital",
      label: hospitalName(query.hospital as never),
      onRemove: onRemoveHospital,
    },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  return (
    <>
      {/* Figma "Find a Doctor Header" 61:3685 (desktop) · "Page Header" 246:2396 (mobile) */}
      <section aria-labelledby="find-doctor-title" className="bg-secondary-50">
        <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-6 lg:pb-8 lg:pt-5 xl:px-0">
          <div className="flex flex-col gap-1 lg:gap-2">
            <h1
              id="find-doctor-title"
              className="font-heading text-h4 font-semibold text-pneutral-900 lg:text-h2"
            >
              Find a Doctor
            </h1>
            <p className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">
              <span className="lg:hidden">Search our specialists and book online.</span>
              <span className="hidden lg:inline">
                Search our specialists by name, specialty, condition or hospital, and book online.
              </span>
            </p>
          </div>

          <SearchBar
            value={draft}
            onChange={onDraftChange}
            onSubmit={onSearch}
            panel={
              isDesktop && filtersOpen ? (
                <FiltersPopover
                  {...panelProps}
                  id={FILTERS_PANEL_ID}
                  triggerRef={filtersButtonRef ?? { current: null }}
                />
              ) : null
            }
          >
            <div className="hidden lg:block">
              <FiltersButton
                ref={filtersButtonRef}
                variant="bar"
                count={filterCount}
                expanded={filtersOpen && isDesktop}
                controls={FILTERS_PANEL_ID}
                onToggle={onToggleFilters}
              />
            </div>
          </SearchBar>

          {/* Mobile toolbar: Filters pill + results count (the desktop toolbar sits above the cards). */}
          <div className="flex items-center gap-2 lg:hidden">
            <FiltersButton
              variant="pill"
              count={filterCount}
              expanded={filtersOpen && !isDesktop}
              controls={FILTERS_PANEL_ID}
              onToggle={onToggleFilters}
            />
            <MobileResultsCount {...countState} />
          </div>

          {chips.length > 0 && <AppliedFilters chips={chips} onClear={onClearApplied} />}
        </div>
      </section>

      {!isDesktop && filtersOpen && <FiltersSheet {...panelProps} />}

      {/* Figma "Results Section" 61:3698 · "Doctor List" 246:2408 */}
      <section
        ref={resultsRef}
        aria-labelledby="doctor-results-title"
        className="scroll-mt-20 bg-white lg:scroll-mt-36 lg:py-8"
      >
        <h2 id="doctor-results-title" className="sr-only">
          Doctor search results
        </h2>
        <div className="mx-auto flex w-full max-w-page items-start gap-6 px-4 py-6 lg:px-6 lg:py-0 xl:px-0">
          <div aria-busy={loading} className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
            <ResultsToolbar
              {...countState}
              sort={query.sort}
              view={query.view}
              onSortChange={onSortChange}
              onViewChange={onViewChange}
            />

            {failed ? (
              <ResultsError onRetry={onRetry} />
            ) : !loading && doctors.length === 0 ? (
              <EmptyResults
                hasFilters={filterCount > 0}
                hasQuery={query.q !== ""}
                onClearFilters={onClearApplied}
                onClearSearch={onClearSearch}
              />
            ) : (
              // Cards keep their own height (a two-line name makes one card taller than its row
              // neighbours in the design), so the grid aligns to the start instead of stretching.
              <ul
                className={cn(
                  "grid grid-cols-1 items-start gap-4 lg:gap-6",
                  !isList && "lg:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {loading
                  ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                      <li key={i}>
                        <DoctorCardSkeleton className="w-full" />
                      </li>
                    ))
                  : doctors.map((doctor) => (
                      <li key={doctor.id}>
                        <DoctorCard
                          doctor={doctor}
                          onViewProfile={onViewProfile}
                          onViewAvailability={onViewAvailability}
                          onCallForAssistance={onCallForAssistance}
                          className={cn("w-full", isList && "lg:hidden")}
                        />
                        {isList && (
                          <DoctorRow
                            doctor={doctor}
                            onViewProfile={onViewProfile}
                            onViewAvailability={onViewAvailability}
                            onCallForAssistance={onCallForAssistance}
                            className="hidden w-full lg:flex"
                          />
                        )}
                      </li>
                    ))}
              </ul>
            )}

            {/* Figma "Pagination Row" 61:3823 (desktop: count + pages) · 246:2524 (mobile: pages only) */}
            <div className="flex min-h-[45px] items-center justify-center lg:justify-between">
              {result && result.total > 0 && (
                <>
                  <p className="hidden font-paragraph text-typo-md text-pneutral-700 lg:block">
                    Showing {result.from} to {result.to} of {result.total} doctors
                  </p>
                  <Pagination
                    page={result.page}
                    pageCount={result.pageCount}
                    hrefFor={hrefForPage}
                  />
                </>
              )}
            </div>
          </div>
          {rail}
        </div>
      </section>

      <HelpSection />
    </>
  );
}

const noop = () => {};

/** Static stand-in rendered by the server (and until hydration) — the loading layout. */
export function DoctorFinderFallback({ rail }: { rail: ReactNode }) {
  return (
    <FinderView
      query={DEFAULT_QUERY}
      draft=""
      onDraftChange={noop}
      onSearch={noop}
      onSortChange={noop}
      onViewChange={noop}
      filterDraft={{ specialty: "", hospital: "" }}
      onFilterDraftChange={noop}
      filtersOpen={false}
      onToggleFilters={noop}
      onApplyFilters={noop}
      onClearFilterDraft={noop}
      onCloseFilters={noop}
      onRemoveSpecialty={noop}
      onRemoveHospital={noop}
      onClearApplied={noop}
      onClearSearch={noop}
      loading
      failed={false}
      result={null}
      onRetry={noop}
      hrefForPage={() => "#"}
      onViewProfile={noop}
      onViewAvailability={noop}
      onCallForAssistance={noop}
      rail={rail}
    />
  );
}

/**
 * /find-doctor — search, filters, sort, view and page all live in the URL query string
 * (`?q=cardio&specialty=Cardiology&hospital=Bengaluru&sort=experience&page=2`), so a refreshed or
 * shared link shows the same results. Data comes from the mock API in `lib/find-doctor`.
 * "View Availability" starts the booking flow (`/book-appointment?doctor=<id>`); "Call for
 * Assistance" opens the assistance overlay.
 */
export function DoctorFinder({ rail }: { rail: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shell = useOptionalShell();

  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const simulate = searchParams.get("simulate");
  const queryString = serializeQuery(query);
  const { loading, result, failed, retry } = useDoctorResults(queryString, simulate);

  // Search box text: edited freely, applied on submit; follows the URL when it changes elsewhere
  // (back/forward, "Clear search").
  const [draft, setDraft] = useState(query.q);
  const [syncedQ, setSyncedQ] = useState(query.q);
  if (query.q !== syncedQ) {
    setSyncedQ(query.q);
    setDraft(query.q);
  }

  // Filters panel: the selection is staged until "Show N Doctors" applies it.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    specialty: query.specialty,
    hospital: query.hospital,
  });
  const resultsRef = useRef<HTMLElement | null>(null);
  const filtersButtonRef = useRef<HTMLButtonElement | null>(null);

  const hrefFor = useCallback(
    (next: DoctorQuery) => {
      const params = new URLSearchParams(serializeQuery(next));
      if (simulate) params.set("simulate", simulate);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, simulate],
  );

  const navigate = useCallback(
    (next: DoctorQuery, mode: "push" | "replace") => {
      router[mode](hrefFor(next), { scroll: false });
    },
    [hrefFor, router],
  );

  // After paging, bring the top of the results back into view (below the sticky header).
  const previousPage = useRef(query.page);
  useEffect(() => {
    if (previousPage.current === query.page) return;
    previousPage.current = query.page;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [query.page]);

  const toggleFilters = () => {
    if (!filtersOpen) setFilterDraft({ specialty: query.specialty, hospital: query.hospital });
    setFiltersOpen((open) => !open);
  };
  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
    filtersButtonRef.current?.focus();
  }, []);

  const onViewProfile = useCallback((doctor: Doctor) => {
    // No profile screen is designed yet.
    // TODO: navigate to /find-doctor/:id once that screen exists.
    console.info("[find-doctor] view profile (placeholder):", doctor.id);
  }, []);
  const onViewAvailability = useCallback(
    // The booking flow starts a booking for the doctor in the URL (Select Appointment Details).
    (doctor: Doctor) => router.push(`/book-appointment?doctor=${encodeURIComponent(doctor.id)}`),
    [router],
  );
  const onCallForAssistance = useCallback(
    (doctor: Doctor) => shell?.openDialog({ kind: "assistance", doctor }),
    [shell],
  );

  return (
    <FinderView
      query={query}
      draft={draft}
      onDraftChange={setDraft}
      onSearch={() => navigate({ ...query, q: draft.trim(), page: 1 }, "push")}
      onSortChange={(sort) => navigate({ ...query, sort, page: 1 }, "replace")}
      onViewChange={(view) => navigate({ ...query, view }, "replace")}
      filterDraft={filterDraft}
      onFilterDraftChange={setFilterDraft}
      filtersOpen={filtersOpen}
      onToggleFilters={toggleFilters}
      onApplyFilters={() => {
        navigate({ ...query, ...filterDraft, page: 1 }, "push");
        closeFilters();
      }}
      onClearFilterDraft={() => setFilterDraft({ specialty: "", hospital: "" })}
      onCloseFilters={closeFilters}
      filtersButtonRef={filtersButtonRef}
      onRemoveSpecialty={() => navigate({ ...query, specialty: "", page: 1 }, "push")}
      onRemoveHospital={() => navigate({ ...query, hospital: "", page: 1 }, "push")}
      onClearApplied={() => navigate(clearFilters(query), "push")}
      onClearSearch={() => navigate({ ...query, q: "", page: 1 }, "push")}
      loading={loading}
      failed={failed}
      result={result}
      onRetry={retry}
      hrefForPage={(page) => hrefFor({ ...query, page })}
      onViewProfile={onViewProfile}
      onViewAvailability={onViewAvailability}
      onCallForAssistance={onCallForAssistance}
      resultsRef={resultsRef}
      rail={rail}
    />
  );
}
