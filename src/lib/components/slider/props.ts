import type { Disableable, OptionalModel, QSize } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";

export type QSliderSize = Exclude<QSize, "none">;
export type QRangeValue = [number, number];

interface QSliderCommonProps extends Disableable {
  /**
   * Minimum selectable value.
   *
   * @default 0
   */
  min?: number;

  /**
   * Maximum selectable value.
   *
   * @default 100
   */
  max?: number;

  /**
   * Value increment. Set to 0 for continuous pointer input.
   *
   * @default 1
   */
  step?: number;

  /**
   * Shows stop indicators. A number sets both their interval and the snapping increment; true uses the step interval.
   *
   * @default false
   */
  markers?: boolean | number;

  /**
   * Shows the current value while the handle is pressed or keyboard-focused.
   *
   * @default false
   */
  label?: boolean;

  /**
   * Uses a vertical orientation. Available in expressive mode. Material 3 recommends keeping range sliders horizontal to reduce cognitive load.
   *
   * @default false
   */
  vertical?: boolean;

  /**
   * Reverses the value direction.
   *
   * @default false
   */
  reverse?: boolean;

  /**
   * Prevents value changes while retaining keyboard focus.
   *
   * @default false
   */
  readonly?: boolean;

  /**
   * Enables Material 3 Expressive sizes, orientation, and motion. Expressive mode can also be enabled globally through Quaff.init().
   *
   * @default false
   */
  expressive?: boolean;

  /**
   * Slider size. Sizes other than xs are available in expressive mode.
   *
   * @default xs
   */
  size?: QSliderSize;

  /**
   * Active track and handle color.
   *
   * @default primary
   */
  color?: string;

  /**
   * Inactive track color.
   *
   * @default secondary-container
   */
  trackColor?: string;

  /**
   * Optional inset icon for a standard expressive slider of size md, lg, or xl.
   */
  icon?: MaterialSymbol | Snippet;

  /**
   * Classes applied to the slider wrapper.
   */
  class?: HTMLAttributes<HTMLDivElement>["class"];

  /**
   * Styles applied to the slider wrapper.
   */
  style?: HTMLAttributes<HTMLDivElement>["style"];
}

type QSliderHTMLInputAttributes = Omit<
  HTMLInputAttributes,
  keyof QSliderCommonProps | "type" | "value"
>;

export interface QSliderProps
  extends OptionalModel<number>, QSliderCommonProps, QSliderHTMLInputAttributes {
  /**
   * Uses the center of the range as the slider origin.
   *
   * @default false
   */
  centered?: boolean;

  /**
   * Text shown in the value indicator instead of the numeric value.
   */
  labelValue?: string | number;
}

export interface QRangeProps
  extends OptionalModel<QRangeValue>, QSliderCommonProps, QSliderHTMLInputAttributes {
  /**
   * Text shown for the lower value indicator.
   */
  minLabelValue?: string | number;

  /**
   * Text shown for the upper value indicator.
   */
  maxLabelValue?: string | number;

  /**
   * Accessible label for the lower-value handle.
   */
  minAriaLabel?: string;

  /**
   * Accessible label for the upper-value handle.
   */
  maxAriaLabel?: string;
}
