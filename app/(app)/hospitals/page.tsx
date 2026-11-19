import type { Metadata } from "next";
import { PlaceholderPage, placeholderTitle } from "@/components/app/placeholder-page";

export const metadata: Metadata = { title: placeholderTitle("hospitals") };

// Placeholder until this page is designed — the label and route come from lib/navigation/menu.ts.
export default function HospitalsPage() {
  return <PlaceholderPage id="hospitals" />;
}
