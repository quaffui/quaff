import type { Clickable, Linkable, WithActiveAttrs } from "$utils";
import type { QExpansionItemProps } from "$components/expansion-item/props";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QNavItemProps
  extends Clickable, Linkable, WithActiveAttrs, Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Marks the item as the current destination and overrides automatic route matching when set.
   * Router links are activated automatically when this prop is omitted.
   */
  active?: boolean;

  /** Uses compact drawer rows. Inherits a containing QList's dense setting when omitted. */
  dense?: boolean;

  /**
   * Optional in drawers; required in navigation bars and railbars. Icons are displayed at 24px.
   * Material Symbols fill automatically when active; custom snippets should provide their own
   * active-state treatment when needed.
   */
  icon?: MaterialSymbol | Snippet;

  /**
   * Visible one- or two-word destination label. Every item should provide this prop or the default
   * children snippet.
   */
  label?: string;

  /**
   * Visible destination label used when the `label` prop is omitted.
   */
  children?: Snippet;

  /**
   * Badge content displayed after the label in drawers, or on the icon in bars and railbars.
   * An empty snippet renders a dot badge; text renders the larger badge variant. Use plain text
   * limited to four characters including `+`, such as `999+`.
   */
  badge?: Snippet;

  /**
   * Accessible badge description announced after the destination label. Provide this whenever the
   * badge conveys information, and always for an otherwise silent dot badge (for example,
   * `"New notification"`).
   */
  badgeAriaLabel?: string;
}

export interface QNavGroupProps extends QExpansionItemProps {
  /** Nested navigation items or groups. A navigation list is provided automatically. */
  children?: Snippet;
}
