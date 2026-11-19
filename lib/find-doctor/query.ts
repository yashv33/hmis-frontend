import { HOSPITALS, SPECIALTIES } from "./doctors";

export const PAGE_SIZE = 6;

/** Figma only draws the "Earliest available" value; the other two options are derived. */
export const SORT_OPTIONS = [
  { value: "earliest", label: "Earliest available" },
  { value: "experience", label: "Most experienced" },
  { value: "name", label: "Name (A–Z)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
export type ViewMode = "grid" | "list";

/** Everything that lives in the URL. An empty string means "no filter". */
export type DoctorQuery = {
  q: string;
  sort: SortKey;
  view: ViewMode;
  page: number;
  specialty: string;
  hospital: string;
};

export const DEFAULT_QUERY: DoctorQuery = {
  q: "",
  sort: "earliest",
  view: "grid",
  page: 1,
  specialty: "",
  hospital: "",
};

type ParamReader = { get(name: string): string | null };

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** Reads a query from the URL; unknown or tampered values fall back to the defaults. */
export function parseQuery(params: ParamReader): DoctorQuery {
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    q: (params.get("q") ?? "").trim().slice(0, 100),
    sort: pick(params.get("sort"), SORT_OPTIONS.map((o) => o.value), DEFAULT_QUERY.sort),
    view: pick(params.get("view"), ["grid", "list"] as const, DEFAULT_QUERY.view),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    specialty: pick(params.get("specialty"), ["", ...SPECIALTIES], ""),
    hospital: pick(params.get("hospital"), ["", ...HOSPITALS], ""),
  };
}

/** Query string without the defaults, so a pristine page has a clean URL. */
export function serializeQuery(query: DoctorQuery): string {
  const params = new URLSearchParams();
  (Object.keys(DEFAULT_QUERY) as (keyof DoctorQuery)[]).forEach((key) => {
    const value = query[key];
    if (value !== DEFAULT_QUERY[key]) params.set(key, String(value));
  });
  return params.toString();
}

/** The number on the "Filters" badge: one per applied filter (specialty, hospital). */
export const activeFilterCount = (query: Pick<DoctorQuery, "specialty" | "hospital">) =>
  (query.specialty ? 1 : 0) + (query.hospital ? 1 : 0);

/** Same query with the filters cleared (search text, sort and view are kept). */
export const clearFilters = (query: DoctorQuery): DoctorQuery => ({
  ...query,
  page: 1,
  specialty: "",
  hospital: "",
});
