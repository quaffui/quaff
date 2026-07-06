import { CssSizeable, CssValue, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QLinearProgressProps
  extends OptionalModel<number>, CssSizeable, HTMLAttributes<HTMLDivElement> {
  /**
   * Secondary progress value, shown as a lighter track behind the main progress.
   */
  buffer?: number;

  /**
   * Reverses the progress bar direction from right-to-left.
   */
  reverse?: boolean;

  /**
   * Removes the rounded sides of the progress bar.
   */
  noRound?: boolean;

  /**
   * Disables the transition animation when the value changes.
   */
  instantFeedback?: boolean;

  /**
   * Color of the progress indicator.
   */
  color?: string;

  /**
   * Color of the background track.
   */
  trackColor?: string;

  /**
   * Duration of the transition animation in milliseconds.
   */
  animationSpeed?: number;

  /**
   * Enables an infinite loading animation instead of showing progress.
   */
  indeterminate?: boolean;
}

export interface QCircularProgressProps
  extends OptionalModel<number>, CssSizeable, HTMLAttributes<HTMLDivElement> {
  /**
   * Enables an infinite spinning animation instead of showing progress.
   */
  indeterminate?: boolean;

  /**
   * Removes the rounded ends of the progress arc.
   */
  noRound?: boolean;

  /**
   * Color of the progress arc.
   */
  color?: string;

  /**
   * Color of the background circle.
   */
  trackColor?: string;

  /**
   * Thickness of the progress arc.
   */
  thickness?: number;

  /**
   * Minimum value for the progress range.
   */
  min?: number;

  /**
   * Maximum value for the progress range.
   */
  max?: number;

  /**
   * Rotation angle of the progress arc in degrees (top is 0 and bottom 180).
   */
  angle?: number;

  /**
   * Shows the current progress value in the center of the circle.
   */
  showValue?: boolean;

  /**
   * Disables the transition animation when the value changes.
   */
  instantFeedback?: boolean;

  /**
   * Duration of the transition animation in milliseconds.
   */
  animationSpeed?: number;

  /**
   * Font size of the center text when showValue is true.
   */
  fontSize?: CssValue | number;
}
