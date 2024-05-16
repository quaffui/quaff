import type { HTMLAttributes } from "svelte/elements";

export interface QRadioProps extends HTMLAttributes<HTMLLabelElement> {
  value: string;
  label?: string;
  selected?: unknown;
  disable?: boolean;
}
