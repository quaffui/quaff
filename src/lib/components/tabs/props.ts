import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps extends HTMLAttributes<HTMLElement> {
  /**
   * Current active tab name. This property is bindable.
   *
   * @default undefined
   */
  value?: string;

  /**
   * Visual style variant of the tabs.
   *
   * @default "primary"
   */
  variant?: QTabsVariants;

  /**
   * Applies rounded corners to the tabs.
   *
   * @default false
   */
  round?: boolean;

  /**
   * Removes the separator line under the tabs (or to the right for vertical tabs).
   *
   * @default false
   */
  noSeparator?: boolean;
}

export interface QTabProps extends HTMLAttributes<HTMLElement> {
  /**
   * Unique identifier for the tab. Used to match with QTabs' value prop.
   */
  name: string;

  /**
   * Navigation target URL when the tab is used as a router link.
   * When provided, the tab will render as an anchor tag.
   *
   * @default undefined
   */
  to?: string;

  /**
   * Icon to display in the tab. Can be a Material Symbol name or a custom snippet.
   *
   * @default undefined
   */
  icon?: MaterialSymbol | Snippet;
}
