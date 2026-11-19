/** "Portal Intro" — Figma 240:1584 (desktop) / 240:1905 (mobile). */
export function PortalIntro() {
  return (
    <div className="flex flex-col items-start gap-4">
      {/* White pill on the lavender mobile background, lavender pill on desktop's white. */}
      <span className="rounded-full bg-white px-3 py-1 font-heading text-typo-sm font-semibold text-secondary-700 lg:bg-secondary-50">
        PATIENT PORTAL
      </span>
      <h1 className="font-heading text-h1 font-light text-pneutral-900">
        <span className="block">Your care,</span>
        <span className="block font-semibold">all in one place.</span>
      </h1>
      <p className="font-paragraph text-typo-md text-pneutral-700 lg:text-typo-lg">
        Log in to book appointments, manage your visits and look after your
        family&apos;s care across TiaMeds hospitals.
      </p>
    </div>
  );
}
