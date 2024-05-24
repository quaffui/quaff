import type { CssValue } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QToolbarProps extends HTMLAttributes<HTMLElement> {
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

export interface QToolbarTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * @default false
   */
  shrink?: boolean;
}
