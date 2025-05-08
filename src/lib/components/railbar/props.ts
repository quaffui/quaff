import type { NativeProps } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QRailbarProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Width of the railbar in pixels.
   *
   * @default 88
   */
  width?: number;

  /**
   * Position of the railbar on the screen.
   *
   * @default left
   */
  side?: "left" | "right";

  /**
   * Adds a border to the railbar to separate it from the main content.
   *
   * @default false
   */
  bordered?: boolean;
}
