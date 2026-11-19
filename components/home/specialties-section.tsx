"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SPECIALTIES } from "@/lib/home/content";

const ROW_FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary-700";

/**
 * "Specialties Section" — Figma 123:16846 (desktop) / 184:77664 (mobile).
 *  desktop — "Browse by Specialty" intro with a search field that filters the list, a
 *            two-column list of eight rows (name, description, doctor count) and the
 *            "View All 40+ Specialties" button
 *  mobile  — eyebrow + two-tone headline, six rows with the count inline, full-width button
 * Each row opens Find a Doctor with that specialty selected.
 */
export function SpecialtiesSection() {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const listId = useId();
  const q = query.trim().toLowerCase();
  const matches = q
    ? SPECIALTIES.filter((s) => `${s.name} ${s.description}`.toLowerCase().includes(q))
    : SPECIALTIES;

  return (
    <section aria-label="Specialties" className="bg-white">
      {/* ---------- mobile ---------- */}
      <div className="flex flex-col gap-6 px-4 py-7 lg:hidden">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-typo-sm font-semibold uppercase text-secondary-700">
            Specialties
          </p>
          <h2 className="font-heading text-h2 font-light text-pneutral-900">
            Start with the <span className="font-semibold text-secondary-800">care you need.</span>
          </h2>
        </div>
        <ul>
          {SPECIALTIES.filter((s) => s.mobile).map((s) => (
            <li key={s.id} className="border-t border-pneutral-200 last:border-b">
              <Link href={s.href} className={`flex items-center gap-3 py-4 ${ROW_FOCUS}`}>
                <span className="flex shrink-0 rounded-full bg-secondary-50 p-3">
                  <Icon name={s.icon} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                  <span className="font-heading text-typo-lg font-semibold text-pneutral-900">
                    {s.name}
                  </span>
                  <span className="font-heading text-typo-sm text-pneutral-700">
                    {s.description} · {s.doctors} doctors
                  </span>
                </span>
                <Icon name="chevron-right" />
              </Link>
            </li>
          ))}
        </ul>
        <Button href="/specialties" variant="outlined" tone="secondary" shape="pill" fullWidth>
          View all 40+ specialties
        </Button>
      </div>

      {/* ---------- desktop ---------- */}
      <div className="hidden py-8 lg:block">
        <div className="mx-auto flex w-full max-w-page items-start gap-6 px-6 pt-8 xl:px-0">
          <div className="flex w-[384px] shrink-0 flex-col gap-4">
            <h2 className="font-heading text-h3 font-semibold text-pneutral-900">
              Browse by Specialty
            </h2>
            <p className="font-paragraph text-typo-lg text-pneutral-700">
              Start with the care you need and we&apos;ll show you the right doctors across our
              hospitals.
            </p>
            <div className="flex h-12 w-full items-center gap-2 rounded-xsm border-[1.5px] border-sneutral-100 bg-white px-[calc(1rem-1.5px)] transition-[border-color,box-shadow] duration-150 hover:border-pneutral-300 focus-within:border-secondary-300 focus-within:shadow-[0_0_0_2px_var(--color-secondary-700)] focus-within:hover:border-secondary-300">
              <Icon name="magnifying-glass-mini-md" />
              <label htmlFor={searchId} className="sr-only">
                Search specialties
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search specialties"
                autoComplete="off"
                aria-controls={listId}
                className="h-full min-w-0 flex-1 bg-transparent font-heading text-typo-md text-pneutral-900 outline-none placeholder:text-pneutral-300 [&::-webkit-search-cancel-button]:appearance-none"
              />
            </div>
            <p role="status" className="sr-only">
              {matches.length === 0
                ? "No specialties match your search"
                : `${matches.length} ${matches.length === 1 ? "specialty" : "specialties"} shown`}
            </p>
            <Button
              href="/specialties"
              variant="outlined"
              tone="brand"
              className="w-[220px]"
            >
              View All 40+ Specialties
            </Button>
          </div>

          {matches.length === 0 ? (
            <p className="flex-1 py-4 font-paragraph text-typo-md text-pneutral-700">
              No specialties match &ldquo;{query.trim()}&rdquo;. Try another name.
            </p>
          ) : (
            <ul
              id={listId}
              className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 xl:grid-flow-col xl:grid-cols-2 xl:grid-rows-4"
            >
              {matches.map((s) => (
                <li key={s.id} className="border-b border-pneutral-200">
                  <Link href={s.href} className={`group flex items-center gap-4 py-4 ${ROW_FOCUS}`}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xsm bg-secondary-50">
                      <Icon name={s.icon} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                      <span className="font-heading text-typo-lg font-semibold text-pneutral-900 group-hover:underline">
                        {s.name}
                      </span>
                      <span className="font-paragraph text-typo-sm text-pneutral-700">
                        {s.description}
                      </span>
                    </span>
                    <span className="shrink-0 font-paragraph text-typo-sm text-pneutral-700">
                      {s.doctors} doctors
                    </span>
                    <Icon name="chevron-right-sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
