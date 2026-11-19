import { DialogLink } from "@/components/app/dialog-link";
import type { DialogState } from "@/components/app/dialogs";
import { Container } from "@/components/layout/container";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

// Figma: "Appointments and Access Band" 214:585 (login) · 246:1958 (signed-in Find a Doctor) ·
// 61:3842 (guest Find a Doctor) — desktop only (the mobile frames end before it).
// "Manage" and "Call now" open the overlays from the guest designs; outside the site shell
// (login, forgot password) they fall back to the plain link.
const LINK_CLASS =
  "inline-flex items-center gap-1 rounded-xsm font-paragraph text-typo-md font-semibold text-primary-800 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

type Target = { href: string; dialog?: DialogState; external?: boolean };

type AccessItem = {
  title: string;
  text: string;
  icon: IconName;
  linkLabel: string;
  target: Target;
  /** In the forgot-password / signed-in frames this card's text wraps instead of staying on one line. */
  wrapsInFlow?: boolean;
  /** Signed-in copy ("member" variant) — the card is "My Appointments" there. */
  member?: { title: string; text: string; linkLabel: string; target: Target };
};

const ACCESS_ITEMS: AccessItem[] = [
  {
    title: "Book an Appointment",
    text: "Choose a doctor and a time online.",
    icon: "access-book",
    linkLabel: "Book now",
    target: { href: "/find-doctor" },
  },
  {
    title: "Manage Appointment",
    text: "View, reschedule or cancel a booking.",
    icon: "access-manage",
    linkLabel: "Manage",
    target: { href: "/manage-appointment", dialog: { kind: "manage" } },
    wrapsInFlow: true,
    member: {
      title: "My Appointments",
      text: "See, reschedule or cancel your bookings.",
      linkLabel: "View",
      target: { href: "/my-appointments" },
    },
  },
  {
    title: "24×7 Helpline",
    text: "+91 98123 12489",
    icon: "access-helpline",
    linkLabel: "Call now",
    target: { href: "tel:+919812312489", dialog: { kind: "helpline" } },
  },
  {
    title: "WhatsApp",
    text: "Quick help, any time.",
    icon: "access-whatsapp",
    linkLabel: "Chat now",
    target: { href: "https://wa.me/919812312489", external: true },
  },
];

type AccessBandProps = {
  /**
   * "login" (default): equal-height cards, every line on one row (Figma 214:585).
   * "flow": the forgot-password frames (283:158334) top-align the cards and let the
   * "Manage Appointment" text wrap, which makes the band 20px taller.
   * "member": the signed-in Find a Doctor frame (246:1958) — same layout as "flow", with the
   * second card renamed "My Appointments".
   */
  variant?: "login" | "flow" | "member";
};

function CardLink({ label, target }: { label: string; target: Target }) {
  const content = (
    <>
      {label}
      <Icon name="arrow-right" />
    </>
  );
  if (target.dialog) {
    return (
      <DialogLink dialog={target.dialog} fallbackHref={target.href} className={LINK_CLASS}>
        {content}
      </DialogLink>
    );
  }
  return (
    <a
      href={target.href}
      {...(target.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={LINK_CLASS}
    >
      {content}
    </a>
  );
}

export function AccessBand({ variant = "login" }: AccessBandProps) {
  const isFlow = variant !== "login";
  const isMember = variant === "member";
  return (
    <section
      aria-labelledby="access-heading"
      className="hidden bg-secondary-50 py-8 lg:block"
    >
      <Container className="flex flex-col gap-6">
        <h2
          id="access-heading"
          className="font-heading text-h3 font-semibold text-pneutral-900"
        >
          Appointments &amp; Access
        </h2>
        <ul className={cn("grid grid-cols-4 gap-6", isFlow && "items-start")}>
          {ACCESS_ITEMS.map((item) => {
            const { icon, wrapsInFlow } = item;
            const { title, text, linkLabel, target } = (isMember && item.member) || item;
            return (
              <li
                key={item.title}
                className="flex flex-col items-start gap-3 rounded-xsm border border-pneutral-200 bg-white p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xsm bg-secondary-100">
                  <Icon name={icon} />
                </span>
                <h3 className="font-heading text-typo-lg font-semibold text-pneutral-900">
                  {title}
                </h3>
                {/* Figma keeps this on one line even where it brushes the card padding. */}
                <p
                  className={cn(
                    "font-paragraph text-typo-md text-pneutral-700",
                    !(isFlow && wrapsInFlow) && "xl:whitespace-nowrap",
                  )}
                >
                  {text}
                </p>
                <CardLink label={linkLabel} target={target} />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
