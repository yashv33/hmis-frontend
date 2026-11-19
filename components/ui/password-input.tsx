"use client";

import { useId, useState, type ComponentProps } from "react";
import { Icon } from "./icon";
import { Input } from "./input";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

/** Input with a show/hide toggle (Figma "Show Password Icon"). */
export function PasswordInput({ id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Input
      {...props}
      id={inputId}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          // Fixed name + aria-pressed: the state is announced, the label never flips.
          aria-label="Show password"
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={() => setVisible((v) => !v)}
          className="-m-1 rounded-xsm p-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-secondary-700"
        >
          <Icon name={visible ? "eye-slash-outline" : "eye-outline"} />
        </button>
      }
    />
  );
}
