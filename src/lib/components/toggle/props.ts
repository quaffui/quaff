import type { HTMLAttributes } from "svelte/elements";

export interface QToggleProps extends HTMLAttributes<HTMLDivElement> {
  value?: boolean;
  label?: string;
  leftLabel?: boolean;
  icon?: string;
  disable?: boolean;
}
