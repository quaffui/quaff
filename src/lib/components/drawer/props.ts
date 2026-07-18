import { Borderable, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QDrawerSideOptions = "left" | "right";
export type QDrawerBehaviorOptions = "default" | "desktop" | "mobile";

export interface QDrawerProps
  extends OptionalModel<boolean>, Borderable, HTMLAttributes<HTMLDivElement> {
  /**
   * The side of the layout where the drawer is positioned.
   */
  side?: QDrawerSideOptions;

  /**
   * The width of the drawer. Can be specified with a CSS unit. If no unit is specified, "px" will be used.
   */
  width?: number;

  /**
   * The viewport width below which the drawer uses modal behavior and swipe gestures.
   */
  breakpoint?: number;

  /**
   * Determines whether the drawer should be shown if the viewport width is above the specified breakpoint. (not supported yet)
   */
  showIfAbove?: boolean;

  /**
   * Controls responsive behavior: "default" follows the breakpoint, "mobile" uses a modal drawer and "desktop" uses a standard drawer.
   */
  behavior?: QDrawerBehaviorOptions;

  /**
   * Determines whether the drawer has an elevated effect. (not supported yet)
   */
  elevated?: boolean;

  /**
   * Determines whether the drawer should behave like an overlay (opening above the content) or not (pushing the content while opening).
   */
  overlay?: boolean;

  /**
   * Determines whether the drawer remains persistent, not closing on click outside.
   */
  persistent?: boolean;

  /**
   * Determines whether swipe gestures opening the drawer should be disabled or not.
   */
  noSwipe?: boolean;

  /**
   * The threshold in percentage of the drawer width that must be swiped for the drawer to snap open/close.
   * This is only applicable if swipe gestures are enabled.
   */
  swipeThreshold?: `${number}%`;
}
