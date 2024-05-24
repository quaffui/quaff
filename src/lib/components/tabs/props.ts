import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps extends HTMLAttributes<HTMLElement> {
  value?: string;
  variant?: QTabsVariants;
  round?: boolean;
}

export interface QTabProps extends HTMLAttributes<HTMLElement> {
  name: string;
  to?: string;
  icon?: string;
  iconSnippet?: Snippet;
}
