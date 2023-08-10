import type { CssValue, NativeProps } from "$lib/utils/types";

export type QDrawerSideOptions = "left" | "right";
export type QDrawerBehaviorOptions = "default" | "desktop" | "mobile";

export interface QDrawerProps extends NativeProps {
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
  width?: number | CssValue;

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
   * Determines whether swipe gestures can open the drawer. (not supported yet)
   * @default false
   */
  noSwipeOpen?: boolean;

  /**
   * Determines whether swipe gestures can close the drawer. (not supported yet)
   * @default false
   */
  noSwipeClose?: boolean;

  /**
   * Determines whether swipe gestures on the backdrop can close the drawer. (not supported yet)
   * @default false
   */
  noSwipeBackdrop?: boolean;
}
