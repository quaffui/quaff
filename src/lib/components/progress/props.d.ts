import type { HTMLAttributes, SVGAttributes } from "svelte/elements";

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * @default 0
   */
  value?: number;
  /**
   * @default 0
   */
  buffer?: number;
  /**
   * @default "0.375em"
   */
  size?: Quaff.CssValue | number;
  /**
   * @default false
   */
  reverse?: boolean;
  /**
   * Removes the border radius to make the progress indicator rectangle.
   *
   * @default false
   */
  noRound?: boolean;
  /**
   * Removes the border radius to make the progress indicator rectangle.
   *
   * @default false
   */
  instantFeedback?: boolean;
  /**
   * @default "primary"
   */
  color?: string;
  /**
   * @default "secondary-container"
   */
  trackColor?: string;
  /**
   * @default 600
   */
  animationSpeed?: number;
  /**
   * @default false
   */
  indeterminate?: boolean;
}

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * @default 0
   */
  value?: number;
  /**
   * @default false
   */
  indeterminate?: boolean;
  /**
   * @default false
   */
  noRound?: boolean;
  /**
   * @default "2em"
   */
  size?: Quaff.CssValue | number;
  /**
   * @default "primary"
   */
  color?: string;
  /**
   * @default "secondary-container"
   */
  trackColor?: string;
  /**
   * @default 5
   */
  thickness?: number;
  /**
   * @default 0
   */
  min?: number;
  /**
   * @default 100
   */
  max?: number;
  /**
   * @default 0
   */
  angle?: number;
  /**
   * @default false
   */
  instantFeedback?: boolean;
  /**
   * @default false
   */
  showValue?: boolean;
  /**
   * @default 600
   */
  animationSpeed?: number;
  /**
   * @default "0.25em"
   */
  fontSize?: Quaff.CssValue | number;
}
