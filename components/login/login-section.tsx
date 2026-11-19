import { LoginForm } from "./login-form";
import { PortalIntro } from "./portal-intro";
import { PortalPreviewSlider } from "./portal-preview-slider";

/**
 * "Login Section" — Figma 240:1581 (desktop, 1440×714) / "Login Body" 240:1904 (mobile).
 * Mobile: one lavender column (intro → slider → card).
 * Desktop (lg+): white background, intro + slider on the left, card on the right.
 */
export function LoginSection() {
  return (
    <section className="bg-secondary-50 px-4 pb-8 pt-6 lg:bg-white lg:px-0 lg:py-7">
      <div className="mx-auto grid w-full max-w-page items-center gap-6 lg:grid-cols-2 lg:px-6 xl:px-0">
        <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
          <PortalIntro />
          <PortalPreviewSlider />
        </div>
        <div className="flex min-w-0 justify-center">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
