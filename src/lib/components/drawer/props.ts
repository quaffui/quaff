import type { NativeProps } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QDrawerSideOptions = "left" | "right";
export type QDrawerBehaviorOptions = "default" | "desktop" | "mobile";

export interface QDrawerProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * The value indicating whether the drawer is visible or hidden.
   * @default true
   */
  value?: boolean;

  /**
   * The side of the layout where the drawer is positioned.
   * @default "left"
   */
  side?: QDrawerSideOptions;

  /**
   * The width of the drawer. Can be specified with a CSS unit. If no unit is specified, "px" will be used.
   * @default 300
   */
  width?: number;

  /**
   * The breakpoint at which the drawer behavior changes. (not supported yet)
   * @default 1023
   */
  breakpoint?: number;

  /**
   * Determines whether the drawer should be shown if the viewport width is above the specified breakpoint. (not supported yet)
   * @default false
   */
  showIfAbove?: boolean;

  /**
   * The behavior of the drawer based on the viewport width. (not supported yet)
   * @default "default"
   */
  behavior?: QDrawerBehaviorOptions;

  /**
   * Determines whether the drawer has a border around it.
   * @default false
   */
  bordered?: boolean;

  /**
   * Determines whether the drawer has an elevated effect. (not supported yet)
   * @default false
   */
  elevated?: boolean;

  /**
   * Determines whether the wrawer should behave like an overlay (opening above the content) or not (pushing the content while opening).
   * @default false
   */
  overlay?: boolean;

  /**
   * Determines whether the drawer remains persistent, not closing on click outside.
   * @default false
   */
  persistent?: boolean;

  /**
   * Determines whether swipe gestures opening the drawer should be disabled or not.
   * @default false
   */
  noSwipe?: boolean;

  /**
   * The threshold in percentage of the drawer width that must be swiped for the drawer to snap open/close.
   * This is only applicable if swipe gestures are enabled.
   * @default "30%"
   */
  swipeThreshold?: `${number}%`;
}
