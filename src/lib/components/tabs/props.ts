import type { HTMLAttributes } from "svelte/elements";
import type { NativeProps } from "$lib/utils";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps extends NativeProps, HTMLAttributes<HTMLElement> {
  value?: string;
  variant?: QTabsVariants;
  round?: boolean;
}

export interface QTabProps extends NativeProps, HTMLAttributes<HTMLElement> {
  name: string;
  to?: string;
  icon?: string;
}
