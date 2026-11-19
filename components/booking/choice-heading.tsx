import type { ReactNode } from "react";

/**
 * The question above a group of choice cards ("Is the patient already registered with this hospital
 * organization?", Figma "Registration Question"): the 20/28 field title, larger (24/32) on mobile.
 */
export function ChoiceHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-heading text-h5 font-semibold text-pneutral-900 lg:text-h6">
      {children}
    </h2>
  );
}
