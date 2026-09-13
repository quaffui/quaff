import { Borderable, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QFooterProps
  extends OptionalModel<boolean>, Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Determines whether the footer should hide on scroll.
   */
  reveal?: boolean;

  /**
   * The distance in pixels from the bottom of the layout content at which the footer is revealed.
   */
  revealOffset?: number;

  /**
   * The height of the footer in pixels.
   */
  height?: number;
}
