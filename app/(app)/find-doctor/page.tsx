import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DoctorFinder, DoctorFinderFallback } from "@/components/find-doctor/doctor-finder";
import { FindDoctorRail } from "@/components/find-doctor/find-doctor-rail";

export const metadata: Metadata = {
  title: "Find a Doctor",
  description: "Search TiaMeds specialists by name, specialty, condition or hospital, and book online.",
};

// Figma "R-01.02 Find a Doctor" — desktop 246:1794, mobile 246:2389. Header, menus and footer
// come from the shared AppLayout (app/(app)/layout.tsx).
// The search and filter state lives in the URL, so the interactive part reads
// `useSearchParams` and needs a Suspense boundary; the fallback is the same layout, loading.
export default function FindDoctorPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Find a Doctor" }]} />
      <Suspense fallback={<DoctorFinderFallback rail={<FindDoctorRail />} />}>
        <DoctorFinder rail={<FindDoctorRail />} />
      </Suspense>
    </>
  );
}
