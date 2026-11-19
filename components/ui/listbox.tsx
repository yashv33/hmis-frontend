"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type ListboxProps = {
  id?: string;
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Select with a drawn option list — Figma "Cancellation Reason" dropdown (G-03.04, closed and
 * "Reason List Open"): the 52px field with a 24px chevron, and a bordered white list under it. A
 * native `<select>` can't draw that list, so this follows the ARIA select-only combobox pattern:
 * a button (`role="combobox"`) that owns a `listbox`; ↑ ↓ Home End move, Enter / Space choose,
 * Esc closes, typing a letter jumps to the next option starting with it, and a click outside closes.
 */
export function Listbox({ id, label, required, placeholder, value, options, onChange, error }: ListboxProps) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-list`;
  const errorId = `${baseId}-error`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const choose = (index: number) => {
    onChange(options[index]);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) return openList();
        setActive((i) => (event.key === "ArrowDown" ? Math.min(options.length - 1, i + 1) : Math.max(0, i - 1)));
        return;
      }
      case "Home":
      case "End":
        if (open) {
          event.preventDefault();
          setActive(event.key === "Home" ? 0 : options.length - 1);
        }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) choose(active);
        else openList();
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const start = open ? active + 1 : 0;
          const ordered = [...options.slice(start), ...options.slice(0, start)];
          const hit = ordered.findIndex((option) => option.toLowerCase().startsWith(event.key.toLowerCase()));
          if (hit >= 0) {
            const index = (hit + start) % options.length;
            if (open) setActive(index);
            else onChange(options[index]);
          }
        }
    }
  };

  return (
    <div ref={rootRef} className="relative flex flex-col">
      <span id={`${baseId}-label`} className="flex items-center gap-1 px-1 font-heading text-typo-lg font-medium text-pneutral-900">
        {label}
        {required && (
          <span aria-hidden="true" className="font-paragraph text-typo-md font-semibold text-warning-500">
            *
          </span>
        )}
      </span>
      <button
        ref={buttonRef}
        id={baseId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${baseId}-label ${baseId}`}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        aria-activedescendant={open ? `${baseId}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex min-h-[52px] w-full items-center gap-3 rounded-xsm border bg-white px-4 py-3 text-left font-paragraph text-typo-lg outline-none transition-[border-color,box-shadow] duration-150",
          error
            ? "border-warning-500 focus-visible:shadow-[0_0_0_1px_var(--color-warning-500),0_0_0_4px_var(--color-warning-50)]"
            : "border-pneutral-300 hover:border-pneutral-500 focus-visible:border-secondary-300 focus-visible:shadow-[0_0_0_2px_var(--color-secondary-700)]",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", value ? "text-pneutral-900" : "text-pneutral-500")}>
          {value || placeholder}
        </span>
        <Icon name="select-chevron" className={cn("transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${baseId}-label`}
          className="mt-4 flex flex-col overflow-hidden rounded-sm border border-pneutral-200 bg-white py-2"
        >
          {options.map((option, index) => (
            <li
              key={option}
              id={`${baseId}-option-${index}`}
              role="option"
              aria-selected={option === value}
              onPointerEnter={() => setActive(index)}
              // Pointer down (not click): the click-outside listener must not close the list first.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={cn(
                "cursor-pointer px-4 py-3 font-paragraph text-typo-md text-pneutral-900",
                index === active && "bg-secondary-50",
                option === value && "font-semibold",
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite">
        {error && (
          <p id={errorId} className="flex items-center gap-1 px-1 font-heading text-typo-md text-warning-500">
            <span>{error}</span>
            <Icon name="exclamation-circle-outline" />
          </p>
        )}
      </div>
    </div>
  );
}
