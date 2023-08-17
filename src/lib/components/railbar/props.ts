import type { NativeProps, CssValue } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export interface QRailbarProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * @default 88px
   */
  width?: CssValue | number;
  /**
   * @default left
   */
  side?: "left" | "right";
  /**
   * @default false
   */
  bordered?: boolean;
}
