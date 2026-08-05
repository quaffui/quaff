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

  /**
   * Width of the railbar in pixels.
   */
  width?: number;

  /**
   * Position of the railbar on the screen.
   */
  side?: "left" | "right";
}
