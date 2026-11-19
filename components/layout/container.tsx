import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Centered 1200px page column (Figma: 120px side margins in the 1440px frame).
 * Below `xl` the column shrinks and keeps a 24px gutter.
 */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-6 xl:px-0", className)}
      {...props}
    />
  );
}
