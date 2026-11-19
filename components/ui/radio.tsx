import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type RadioProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  className?: string;
};

/**
 * Figma "Form Control / Radio": a 24px circle (grey ring, dark ring + dot when selected) with a
 * Work Sans medium 16/24 label, 12px apart. A real `<input type="radio">` sits visually hidden
 * on top, so arrow-key navigation inside the group and screen-reader semantics are native; the
 * focus ring is drawn around the circle.
 */
export function Radio({ name, value, checked, onChange, label, className }: RadioProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-3", className)}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span className="flex shrink-0 rounded-full outline-secondary-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        <Icon name={checked ? "radio-on" : "radio-off"} />
      </span>
      <span className="font-heading text-typo-lg font-medium text-pneutral-900">{label}</span>
    </label>
  );
}
