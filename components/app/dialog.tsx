"use client";

import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

type DialogProps = {
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  /**
   * Desktop position. The Manage-appointment dialog sits 12px higher than the others in Figma
   * (245 vs 257px); the calendar dialog is vertically centred.
   */
  placement?: "default" | "high" | "center";
  /** default — 520px, 32px padding · compact — the 332px calendar dialog, 24px padding. */
  size?: "default" | "compact";
};

/**
 * Shared shell of every overlay in the guest flow: a centred 520px dialog on desktop (Figma
 * "Assistance Dialog", 32px padding, 16px radius, card shadow) and a bottom sheet on mobile
 * (28px top radius, handle, 16px padding). Pneutral-900 scrim at 48%; clicking it, Esc and the
 * close button dismiss. Focus is trapped, the page behind can't scroll and focus returns to the
 * opener on close.
 *
 * Figma floats the mobile sheets 338px from the top of an 812px frame with a gap below; they are
 * anchored to the bottom of the screen here, as a bottom sheet is.
 */
export function Dialog({
  onClose,
  labelledBy,
  describedBy,
  children,
  placement = "default",
  size = "default",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(true);
  useFocusTrap(panelRef, true, { onEscape: onClose });

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-end justify-center lg:px-4",
        placement === "center"
          ? "lg:items-center lg:py-4"
          : placement === "high"
            ? "lg:items-start lg:pt-[min(245px,27.2vh)]"
            : "lg:items-start lg:pt-[min(257px,28.6vh)]",
      )}
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-pneutral-900/48" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100dvh-1rem)] w-full flex-col items-center gap-4 overflow-y-auto rounded-t-xxlg bg-white px-4 pb-8 pt-3 shadow-card outline-none lg:items-stretch lg:rounded-lg",
          size === "compact" ? "lg:max-w-[332px] lg:p-6" : "lg:max-w-[520px] lg:p-8",
        )}
      >
        <span aria-hidden="true" className="h-1 w-10 shrink-0 rounded-full bg-pneutral-300 lg:hidden" />
        {children}
      </div>
    </div>
  );
}

/** Icon tile + title + close button (Figma "Dialog Header"). */
export function DialogHeader({
  icon,
  title,
  titleId,
  onClose,
}: {
  icon: IconName;
  title: string;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="flex rounded-full bg-secondary-50 p-3">
        <Icon name={icon} />
      </span>
      <h2 id={titleId} className="flex-1 font-heading text-h6 font-semibold text-pneutral-900">
        {title}
      </h2>
      <Button
        variant="text"
        size="sm"
        shape="pill"
        iconOnly
        icon="x-mark-sm"
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );
}
