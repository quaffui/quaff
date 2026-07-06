import { Borderable, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QFooterProps
  extends OptionalModel<boolean>, Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Determines whether the footer should hide on scroll.
   */
  reveal?: boolean;

  /**
   * The offset in pixels to trigger the reveal effect. The footer will be hidden when the scroll position is greater than this value.
   */
  revealOffset?: number;

  /**
   * The height of the footer. Can be specified with a CSS unit. If not specified, "px" will be used. (specified CSS units are not supported yet)
   */
  height?: number;
}
