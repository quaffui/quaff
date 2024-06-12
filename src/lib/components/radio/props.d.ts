import type { HTMLAttributes } from "svelte/elements";

export interface RadioProps extends HTMLAttributes<HTMLLabelElement> {
  value: string,
  label?: string,
  selected?: any,
  disabled?: boolean
}