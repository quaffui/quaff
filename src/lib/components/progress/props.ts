import type { HTMLAttributes } from "svelte/elements";

export interface QLinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value as a percentage. This prop is bindable.
   *
   * @default 0
   */
  value?: number;

  /**
   * Secondary progress value, shown as a lighter track behind the main progress.
   *
   * @default undefined
   */
  buffer?: number;

  /**
   * Height of the progress bar.
   *
   * @default "0.375em"
   */
  size?: Q.CssValue | number;

  /**
   * Reverses the progress bar direction from right-to-left.
   *
   * @default false
   */
  reverse?: boolean;

  /**
   * Removes the rounded sides of the progress bar.
   *
   * @default false
   */
  noRound?: boolean;

  /**
   * Disables the transition animation when the value changes.
   *
   * @default false
   */
  instantFeedback?: boolean;

  /**
   * Color of the progress indicator.
   *
   * @default "primary"
   */
  color?: string;

  /**
   * Color of the background track.
   *
   * @default "secondary-container"
   */
  trackColor?: string;

  /**
   * Duration of the transition animation in milliseconds.
   *
   * @default 600
   */
  animationSpeed?: number;

  /**
   * Enables an infinite loading animation instead of showing progress.
   *
   * @default false
   */
  indeterminate?: boolean;
}

export interface QCircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value as a percentage. This prop is bindable.
   *
   * @default 0
   */
  value?: number;

  /**
   * Enables an infinite spinning animation instead of showing progress.
   *
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Removes the rounded ends of the progress arc.
   *
   * @default false
   */
  noRound?: boolean;

  /**
   * Overall size of the circular progress component.
   *
   * @default "2em"
   */
  size?: Q.CssValue | number;

  /**
   * Color of the progress arc.
   *
   * @default "primary"
   */
  color?: string;

  /**
   * Color of the background circle.
   *
   * @default "secondary-container"
   */
  trackColor?: string;

  /**
   * Thickness of the progress arc.
   *
   * @default 0.2
   */
  thickness?: number;

  /**
   * Minimum value for the progress range.
   *
   * @default 0
   */
  min?: number;

  /**
   * Maximum value for the progress range.
   *
   * @default 100
   */
  max?: number;

  /**
   * Rotation angle of the progress arc in degrees (top is 0 and bottom 180).
   *
   * @default 0
   */
  angle?: number;

  /**
   * Shows the current progress value in the center of the circle.
   *
   * @default false
   */
  showValue?: boolean;

  /**
   * Disables the transition animation when the value changes.
   *
   * @default false
   */
  instantFeedback?: boolean;

  /**
   * Duration of the transition animation in milliseconds.
   *
   * @default 600
   */
  animationSpeed?: number;

  /**
   * Font size of the center text when showValue is true.
   *
   * @default "0.25em"
   */
  fontSize?: Q.CssValue | number;
}
