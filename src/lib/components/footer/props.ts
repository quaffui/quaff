import type { NativeProps } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QFooterProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * The value indicating whether the footer is visible or hidden.
   * @default true
   */
  value?: boolean;

  /**
   * Determines whether the footer has a top border.
   * @default false
   */
  bordered?: boolean;

  /**
   * Determines whether the footer should hide on scroll.
   * @default false
   */
  reveal?: boolean;

  /**
   * The offset in pixels to trigger the reveal effect. The footer will be hidden when the scroll position is greater than this value.
   * @default 250
   */
  revealOffset?: number;

  /**
   * The height of the footer. Can be specified with a CSS unit. If not specified, "px" will be used. (specified CSS units are not supported yet)
   * @default undefined
   */
  height?: number;
}
