import type { EventHandler, HTMLAttributes, MouseEventHandler } from "svelte/elements";

export interface FieldProps extends HTMLAttributes<HTMLLabelElement> {
  value: string,
  type: "text" | "file" | "password",
  filled?: boolean,
  outlined?: boolean,
  disabled?: boolean,
  label?: string,
  error?: boolean,
  errorMessage?: string,
  hint?: string,
  icon?: string
  onIconClick?: MouseEventHandler<HTMLElement>,
  iconRight?: string
  onRightIconClick?: MouseEventHandler<HTMLElement>,
}