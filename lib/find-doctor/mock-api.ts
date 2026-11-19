import { DOCTORS, hospitalName } from "./doctors";
import { PAGE_SIZE, type DoctorQuery } from "./query";
import type { Doctor } from "./types";

export type SearchResult = {
  doctors: Doctor[];
  total: number;
  page: number;
  pageCount: number;
  /** 1-based index of the first / last doctor on this page (0 when there are no results). */
  from: number;
  to: number;
};

/** Simulated network round trip, long enough for the skeletons to be seen. */
const LATENCY_MS = 600;

/** `?simulate=error` on the page URL makes every request fail so the error state can be seen. */
export class DoctorSearchError extends Error {
  constructor() {
    super("The doctor directory could not be reached.");
    this.name = "DoctorSearchError";
  }
}

function matchesText(doctor: Doctor, q: string): boolean {
  if (!q) return true;
  const haystack = [
    doctor.name,
    doctor.qualifications.join(" "),
    doctor.specialty,
    doctor.department,
    doctor.hospital,
    hospitalName(doctor.hospital),
    doctor.conditions.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

type Criteria = Pick<DoctorQuery, "q" | "specialty" | "hospital">;

/**
 * The plain directory lists 24 doctors (Figma pages 1–4); the two extra cardiologists only appear
 * once the visitor searches or filters.
 */
function matches(doctor: Doctor, { q, specialty, hospital }: Criteria): boolean {
  const narrowed = Boolean(q || specialty || hospital);
  if (!doctor.listed && !narrowed) return false;
  if (specialty && doctor.specialty !== specialty) return false;
  if (hospital && doctor.hospital !== hospital) return false;
  return matchesText(doctor, q);
}

/** Synchronous count for the filter panel's "N doctors match your filters" line. */
export const countDoctors = (criteria: Criteria): number =>
  DOCTORS.filter((doctor) => matches(doctor, criteria)).length;

function sortDoctors(doctors: Doctor[], sort: DoctorQuery["sort"]): Doctor[] {
  const sorted = [...doctors];
  switch (sort) {
    case "experience":
      return sorted.sort((a, b) => b.experienceYears - a.experienceYears);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      // The design lists doctors in this order under "Earliest available".
      return sorted.sort((a, b) => a.rank - b.rank);
  }
}

/** Frontend-only stand-in for `GET /doctors?...`. Resolves after a short delay. */
export function searchDoctors(
  query: DoctorQuery,
  options: { simulate?: string | null } = {},
): Promise<SearchResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options.simulate === "error") {
        reject(new DoctorSearchError());
        return;
      }
      const found = sortDoctors(
        DOCTORS.filter((d) => matches(d, query)),
        query.sort,
      );
      const total = found.length;
      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(query.page, pageCount);
      const start = (page - 1) * PAGE_SIZE;
      const doctors = found.slice(start, start + PAGE_SIZE);
      resolve({
        doctors,
        total,
        page,
        pageCount,
        from: total === 0 ? 0 : start + 1,
        to: start + doctors.length,
      });
    }, LATENCY_MS);
  });
}
