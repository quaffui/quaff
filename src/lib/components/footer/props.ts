import type { CssValue, NativeProps } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export interface QFooterProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * The value indicating whether the footer is visible or hidden. (not supported yet)
   * @default true
   */
  value?: boolean;

  /**
   * Determines whether the footer has a border around it. (not supported yet)
   * @default false
   */
  border?: boolean;

  /**
   * Determines whether the footer has an elevated effect. (not supported yet)
   * @default false
   */
  elevate?: boolean;

  /**
   * The height of the footer. Can be specified with a CSS unit. If not specified, "px" will be used. (not supported yet)
   * @default undefined
   */
  height?: number | CssValue;
}
