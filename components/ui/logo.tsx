import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The exported logo PNG (551×213) has transparent padding, so Figma crops it
 * inside a fixed frame. These offsets reproduce Figma's crop exactly — note that
 * the design itself scales the artwork slightly non-uniformly (~13% taller).
 *
 * header — Logo component (170×58 desktop header, 102×34.8 mobile header)
 * footer — Logo inside the footer card (121×56)
 */
const CROPS = {
  header: {
    image: "left-[-6.32%] top-[-24.14%] h-[144.83%] w-[113.29%]",
    sizes: "(min-width: 1024px) 193px, 116px",
  },
  footer: {
    image: "left-[-4.28%] top-0 h-full w-[106.41%]",
    sizes: "129px",
  },
} as const;

type LogoProps = {
  variant?: keyof typeof CROPS;
  /** Size the frame, e.g. `h-[58px] w-[170px]`. */
  className?: string;
};

export function Logo({ variant = "header", className }: LogoProps) {
  const crop = CROPS[variant];
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <Image
        src="/images/logo.png"
        alt="TiaMeds"
        width={551}
        height={213}
        sizes={crop.sizes}
        loading="eager"
        className={cn("pointer-events-none absolute max-w-none", crop.image)}
      />
    </span>
  );
}
