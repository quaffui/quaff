import type { CssSizeable } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QLoadingIndicatorProps
  extends CssSizeable, Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Adds a circular background behind the indicator.
   */
  contained?: boolean;

  /**
   * Indicator color. Defaults to primary, or on-primary-container when contained.
   */
  color?: string;

  /**
   * Contained background color. Defaults to primary-container.
   */
  containerColor?: string;
}
