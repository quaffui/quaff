import type { Borderable } from "$utils";
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

export type { QNavItemProps } from "../nav-item/props";
