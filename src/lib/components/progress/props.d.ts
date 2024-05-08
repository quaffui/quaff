import type { HTMLAttributes } from "svelte/elements";

export interface QLinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * @default 0
   */
  value?: number;

  /**
   * @default undefined
   */
  buffer?: number;

  /**
   * @default "0.375em"
   */
  size?: __Quaff__.CssValue | number;

  /**
   * @default false
   */
  reverse?: boolean;

  /**
   * @default false
   */
  noRound?: boolean;

  /**
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

export interface QCircularProgressProps extends HTMLAttributes<HTMLDivElement> {
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
  size?: __Quaff__.CssValue | number;

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
  showValue?: boolean;

  /**
   * @default false
   */
  instantFeedback?: boolean;

  /**
   * @default 600
   */
  animationSpeed?: number;

  /**
   * @default "0.25em"
   */
  fontSize?: __Quaff__.CssValue | number;
}
