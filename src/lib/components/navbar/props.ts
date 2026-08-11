import type { Borderable, Clickable, Linkable, WithActiveAttrs } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QNavbarProps extends Borderable, Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Color of active destination indicators. Use a theme container color such as
   * `primary-container`. See <link to colors docs> for supported color values.
   *
   * @default "secondary-container"
   */
  activeColor?: string;

  /**
   * Minimum height of the navigation bar in pixels, excluding the bottom safe-area inset.
   *
   * @default 64
   */
  height?: number;

  /**
   * Places each destination's icon and label next to each other. Material Design recommends this
   * arrangement for medium-width layouts from 600px through 839px.
   *
   * @default false
   */
  horizontal?: boolean;

  /**
   * Three to five stable, equal-priority destinations rendered as `QNavItem` components.
   */
  children?: Snippet;
}

export interface QNavItemProps
  extends Clickable, Linkable, WithActiveAttrs, Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Marks the item as the current destination and overrides automatic route matching when set.
   * Router links are activated automatically when this prop is omitted.
   */
  active?: boolean;

  /**
   * Material Symbol name or custom snippet displayed at 24px. Material Symbols fill automatically
   * when active; custom snippets should provide their own active-state treatment when needed.
   */
  icon: MaterialSymbol | Snippet;

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
   * Badge content displayed on the icon. An empty snippet renders a dot badge; text renders the
   * larger badge variant. Use plain text limited to four characters including `+`, such as `999+`.
   */
  badge?: Snippet;

  /**
   * Accessible badge description announced after the destination label. Provide this whenever the
   * badge conveys information, and always for an otherwise silent dot badge (for example,
   * `"New notification"`).
   */
  badgeAriaLabel?: string;
}
