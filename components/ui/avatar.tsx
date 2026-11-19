import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type DoctorAvatarProps = {
  /** Doctor's name — used for the alt text. */
  name: string;
  /** Portrait from /public. Without one, the Figma placeholder (grey tile, purple user glyph) is drawn. */
  src?: string;
  /** Size, e.g. `size-16 lg:size-[72px]`. The corner radius belongs to the avatar. */
  className?: string;
};

/**
 * Doctor portrait tile (Figma "Doctor Photograph"). The desktop card shows the photo 125% scaled
 * inside a 72px tile with 4px corners (a tight face crop); the mobile card fills a 64px tile with
 * 12px corners using `object-cover`. Doctors without a portrait get the "Placeholder" avatar:
 * pneutral-50 tile, white 2px ring, 20px corners and a 76px user glyph pushed 15px below centre.
 */
export function DoctorAvatar({ name, src, className }: DoctorAvatarProps) {
  if (!src) {
    return (
      <span
        role="img"
        aria-label={`Photo placeholder for ${name}`}
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-[20px] border-2 border-white bg-pneutral-50",
          className,
        )}
      >
        <Icon
          name="avatar-placeholder-lg"
          className="absolute left-1/2 top-[calc(50%+15px)] -translate-x-1/2 -translate-y-1/2"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-sm bg-secondary-100 lg:rounded-[4px]",
        className,
      )}
    >
      <Image
        src={src}
        alt={`Photo of ${name}`}
        width={90}
        height={90}
        sizes="(min-width: 1024px) 90px, 64px"
        className="pointer-events-none absolute left-0 top-0 size-full max-w-none object-cover lg:-left-[12.5%] lg:-top-[2.5%] lg:size-[125%]"
      />
    </span>
  );
}

const ACCOUNT_AVATAR = {
  // XSmall (32px) variant used at 24px: header trigger and mobile header
  sm: { frame: "size-6 border-[1.5px]", icon: "avatar-user", offset: "top-[calc(50%+4px)]" },
  // Medium (40px): account menu and mobile menu summary
  md: { frame: "size-10 border-2", icon: "avatar-user-md", offset: "top-[calc(50%+7px)]" },
} as const;

/**
 * Figma "Account Avatar" — circle with the user glyph. `sm` (24px) sits in the logged-in
 * headers, `md` (40px) in the account summary of the dropdown and the mobile menu.
 */
export function AccountAvatar({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  const { frame, icon, offset } = ACCOUNT_AVATAR[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full border-white bg-pneutral-50",
        frame,
        className,
      )}
    >
      <Icon
        name={icon}
        className={cn("absolute left-1/2 -translate-x-1/2 -translate-y-1/2", offset)}
      />
    </span>
  );
}
