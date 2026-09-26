import { Borderable } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QRailbarProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Color of active destination indicators. Use a theme container color such as
   * `primary-container`. See <link to colors docs> for supported color values.
   *
   * @default "secondary-container"
   */
  activeColor?: string;

  /** Whether the rail is expanded. Can be bound with `bind:expanded`. */
  expanded?: boolean;

  /**
   * Expand above the page with a scrim, keeping the collapsed layout space.
   * Escape or a click on the scrim collapses the rail.
   */
  modal?: boolean;

  /** Width of the expanded railbar in pixels. */
  expandedWidth?: number;

  /**
   * Width of the collapsed railbar in pixels.
   */
  width?: number;

  /**
   * Position of the railbar. "start" and "end" follow its direction; "left" and "right" stay physical.
   */
  side?: "start" | "end" | "left" | "right";
}
