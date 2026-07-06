import { Borderable } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QRailbarProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Width of the railbar in pixels.
   */
  width?: number;

  /**
   * Position of the railbar on the screen.
   */
  side?: "left" | "right";
}
