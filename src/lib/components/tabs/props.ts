import { OptionalModel, WithActiveAttrs } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps
  extends OptionalModel<string>, WithActiveAttrs, HTMLAttributes<HTMLElement> {
  /**
   * Visual style variant of the tabs.
   */
  variant?: QTabsVariants;

  /**
   * Removes the separator line under the tabs (or to the right for vertical tabs).
   */
  noSeparator?: boolean;
}

export interface QTabProps extends WithActiveAttrs, HTMLAttributes<HTMLElement> {
  /**
   * Unique identifier for the tab. Used to match with QTabs' value prop.
   */
  name: string;

  /**
   * Navigation target URL when the tab is used as a router link.
   * When provided, the tab will render as an anchor tag.
   */
  to?: string;

  /**
   * Icon to display in the tab. Can be a Material Symbol name or a custom snippet.
   */
  icon?: MaterialSymbol | Snippet;
}
