import type { Metadata } from "next";
import { PlaceholderPage, placeholderTitle } from "@/components/app/placeholder-page";

export const metadata: Metadata = { title: placeholderTitle("family-members") };

// Placeholder until this page is designed — the label and route come from lib/navigation/menu.ts.
export default function FamilyMembersPage() {
  return <PlaceholderPage id="family-members" />;
}
