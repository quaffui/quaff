import type { NativeProps } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QRailbarProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * @default 88
   */
  width?: number;
  /**
   * @default left
   */
  side?: "left" | "right";
  /**
   * @default false
   */
  bordered?: boolean;
}
