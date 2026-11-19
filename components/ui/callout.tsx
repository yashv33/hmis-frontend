import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type CalloutProps = {
  /** info = lavender "Message" (shield icon) · error = red "Message - We couldn't find an account". */
  tone: "info" | "error";
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * Figma "Message – …" boxes (12px radius, 16px padding, 20px icon, title 20/28 + body 14/20).
 * The error tone is announced to assistive tech when it appears.
 */
export function Callout({ tone, title, children, className }: CalloutProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-sm p-4",
        isError ? "bg-warning-50 text-warning-600" : "bg-secondary-50 text-pneutral-900",
        className,
      )}
    >
      <Icon name={isError ? "exclamation-triangle-solid" : "shield-check-brand"} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-heading text-h6 font-semibold">{title}</p>
        <p className="font-paragraph text-typo-md">{children}</p>
      </div>
    </div>
  );
}
