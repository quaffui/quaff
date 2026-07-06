import { CssValue } from "../base";
import { QSize } from "../quaff";

/**
 * Gives components support for the size property, allowing predefined sizes to be chosen.
 * 
 * The type parameter `ToExclude` is used to exclude sizes that are not applicable to the component.
 
 */
export interface QSizeable<ToExclude extends QSize | undefined = undefined> {
  /**
   * Size of the component to choose between multiple predefined sizes.
   */
  size?: Exclude<QSize, ToExclude>;
}

/**
 * Gives components support for the size property, allowing predefined sizes to be chosen.
 *
 * The type parameter `ToExclude` is used to exclude sizes that are not applicable to the component.
 *
 * Also supports CSS size values (e.g. "40px", "1rem").
 * If a number is provided, it will be converted to a px value.
 */
export interface CssSizeable {
  /**
   * Size of the component using CSS size values (e.g. "40px", "1rem").
   * If a number is provided, it will be converted to a px value.
   */
  size?: CssValue | number;
}

/**
 * Gives components support for the size property, allowing predefined sizes to be chosen.
 *
 * The type parameter `ToExclude` is used to exclude sizes that are not applicable to the component.
 *
 * Also supports CSS size values (e.g. "40px", "1rem").
 * If a number is provided, it will be converted to a px value.
 */
export interface Sizeable<ToExclude extends QSize | undefined = undefined> {
  /**
   * Size of the component to choose between multiple predefined sizes.
   *
   * Also supports CSS size values (e.g. "40px", "1rem").
   * If a number is provided, it will be converted to a px value.
   */
  size?: Exclude<QSize, ToExclude> | CssValue | number;
}

/**
 * Gives the component a border to better separate it from its environment
 */
export interface Borderable {
  /**
   * Whether the component should have a border.
   */
  bordered?: boolean;
}
