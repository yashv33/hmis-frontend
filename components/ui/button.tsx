import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

/**
 * Variants (Figma ".Button Base"):
 *  filled    — primary actions (primary-800)
 *  outlined  — bordered; `tone` picks the colour: secondary (default, Back /
 *              Continue as Guest / Log in), brand (Chat on WhatsApp), deep (search)
 *  text      — nav items, top-bar links, "Forgot Password?", "Resend OTP" (primary-800);
 *              `tone="secondary"` gives the secondary-700 text of the manage-flow "Back"
 *
 * Sizes: sm = 36px · md = 48px · lg = 56px tall. The outlined border grows with
 * the size (1.5 / 2 / 2.5px) exactly as in the designs.
 * Shapes: mobile frames use fully-rounded buttons, desktop uses 8px (`responsive`).
 * Horizontal padding can be tightened for a context with `[--btn-px:…]`.
 *
 * Figma only draws the enabled state. hover / focus-visible / disabled / loading
 * are derived from the same tokens (see notes in the PR/summary).
 */
type Variant = "filled" | "outlined" | "text";
type Tone = "secondary" | "brand" | "deep";
type Size = "sm" | "md" | "lg";
type Shape = "rounded" | "pill" | "responsive";

const BASE =
  "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-heading font-medium transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-700";

const FILLED =
  "bg-primary-800 text-white hover:bg-primary-900 active:bg-primary-900 lg:text-pneutral-50 " +
  "disabled:bg-pneutral-200 disabled:text-pneutral-500";

const TEXT =
  "hover:bg-secondary-50 active:bg-secondary-100 disabled:text-pneutral-500 disabled:hover:bg-transparent";

const OUTLINED: Record<Tone, string> = {
  secondary:
    "border-secondary-700 text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 " +
    "disabled:border-pneutral-200 disabled:text-pneutral-500 disabled:hover:bg-transparent",
  brand:
    "border-primary-800 text-primary-800 hover:bg-secondary-100 active:bg-secondary-100 " +
    "disabled:border-pneutral-200 disabled:text-pneutral-500 disabled:hover:bg-transparent",
  deep:
    "border-primary-900 text-primary-900 hover:bg-secondary-50 active:bg-secondary-100 " +
    "disabled:border-pneutral-200 disabled:text-pneutral-500 disabled:hover:bg-transparent",
};

// `outlinedPx` = the same padding minus the border: Figma draws the stroke inside
// the button, CSS adds it on top, so outlined buttons would otherwise end up wider.
const SIZES: Record<
  Size,
  { text: string; outlinedPx: string; icon: string; border: string }
> = {
  sm: {
    text: "h-9 min-w-[108px] gap-2 px-[var(--btn-px,0.75rem)] text-typo-md",
    outlinedPx: "px-[calc(var(--btn-px,0.75rem)-1.5px)]",
    icon: "size-9",
    border: "border-[1.5px]",
  },
  md: {
    text: "h-12 min-w-[108px] gap-2 px-[var(--btn-px,1rem)] text-typo-lg",
    outlinedPx: "px-[calc(var(--btn-px,1rem)-2px)]",
    icon: "size-12",
    border: "border-2",
  },
  lg: {
    text: "h-14 min-w-[108px] gap-2 px-[var(--btn-px,1.25rem)] text-typo-xl",
    outlinedPx: "px-[calc(var(--btn-px,1.25rem)-2.5px)]",
    icon: "size-14",
    border: "border-[2.5px]",
  },
};

const SHAPES: Record<Shape, string> = {
  rounded: "rounded-xsm",
  pill: "rounded-full",
  responsive: "rounded-full lg:rounded-xsm",
};

type OwnProps = {
  variant?: Variant;
  /** Colour of an `outlined` button (secondary by default); on a `text` button only "secondary" applies. */
  tone?: Tone;
  size?: Size;
  shape?: Shape;
  /** Leading icon (from public/icons). */
  icon?: IconName;
  /** Trailing icon element, e.g. `<Icon name="arrow-right-outline" />`. Hidden while loading. */
  iconRight?: ReactNode;
  /** Square button that only shows an icon — pass `aria-label`. */
  iconOnly?: boolean;
  /** Shows a spinner, sets aria-busy and blocks clicks while keeping focus. */
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
};

type ButtonProps = OwnProps &
  Omit<ComponentProps<"button">, keyof OwnProps> & { href?: undefined };
type LinkButtonProps = OwnProps &
  Omit<ComponentProps<"a">, keyof OwnProps | "href"> & { href: string };

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = "filled",
    tone,
    size = "md",
    shape = "rounded",
    icon,
    iconRight,
    iconOnly = false,
    loading = false,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;

  const variantClasses =
    variant === "filled"
      ? FILLED
      : variant === "text"
        ? cn(TEXT, tone === "secondary" ? "text-secondary-700" : "text-primary-800")
        : cn(SIZES[size].border, OUTLINED[tone ?? "secondary"]);

  // Outlined text buttons swap the plain padding for the border-compensated one.
  const sizeClasses = iconOnly
    ? SIZES[size].icon
    : variant === "outlined"
      ? SIZES[size].text.replace(/px-\[[^\]]+\]/, SIZES[size].outlinedPx)
      : SIZES[size].text;

  const classes = cn(
    BASE,
    variantClasses,
    sizeClasses,
    SHAPES[shape],
    fullWidth && "w-full",
    loading && "cursor-wait",
    "disabled:cursor-not-allowed",
    className,
  );

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      ) : (
        icon && <Icon name={icon} />
      )}
      {children}
      {!loading && iconRight}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as Omit<LinkButtonProps, keyof OwnProps>;
    // In-app routes use next/link; tel:, mailto: and absolute URLs stay plain anchors.
    const isInternal = href.startsWith("/") || href.startsWith("#");
    return isInternal ? (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const { onClick, type = "button", ...buttonProps } = rest as Omit<
    ButtonProps,
    keyof OwnProps
  >;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      // Not `disabled`: a disabled button drops keyboard focus mid-request.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      type={type}
      // Only attach a handler when there is something to handle, so purely
      // presentational buttons can still render inside Server Components.
      onClick={loading || onClick ? handleClick : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={classes}
    >
      {content}
    </button>
  );
}
