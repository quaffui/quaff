import type { NativeProps, CssValue } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QToolbarProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * @default false
   */
  inset?: boolean;
  /**
   * @default false
   */
  border?: boolean;
  /**
   * @default false
   */
  elevate?: boolean;
  /**
   * @default 64px
   */
  height?: CssValue | number;
}

export interface QToolbarTitleProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * @default false
   */
  shrink?: boolean;
}
