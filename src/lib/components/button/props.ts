import type { MaterialSymbol } from "material-symbols";
import type { HTMLAttributes, HTMLAnchorAttributes, MouseEventHandler } from "svelte/elements";

export type QBtnSizeOptions = Exclude<Q.Size, "xs">;

export type QBtnVariantOptions = "elevated" | "filled" | "tonal" | "outlined" | "flat";

export interface QBtnProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Puts the button in a disabled state, making it unclickable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Sets the color of the button. If a color is specified, it overwrites all other color variants defined with boolean attributes.
   */
  color?: string;

  /**
   * Choose the variant for the button. If a variant is specified, it overwrites all other variants defined with boolean attributes. If no variant is specified using this prop or boolean props, the `elevated` variant will be used.
   */
  variant?: QBtnVariantOptions;

  /**
   * Equivalent to `variant="filled"`. Overwritten by `variant` but overwrites `tonal`, `outlined` and `flat`.
   * @default false
   */
  filled?: boolean;

  /**
   * Equivalent to `variant="tonal"`. Overwritten by `variant` and `filled` but overwrites `outlined` and `flat`.
   * @default false
   */
  tonal?: boolean;

  /**
   * Equivalent to `variant="outlined"`. Overwritten by `variant`, `filled` and `tonal` but overwrites `flat`.
   * @default false
   */
  outlined?: boolean;

  /**
   * Equivalent to `variant="flat"`. Overwritten by any other variant if defined with the `variant` prop or other boolean variant props.
   * @default false
   */
  flat?: boolean;

  /**
   * Name of the leading icon to use for the button.
   * @default undefined
   */
  icon?: MaterialSymbol | `img:${string}`;

  /**
   * Text to use for the button.
   * @default undefined
   */
  label?: string;

  /**
   * Puts the button in a loading state, adding a loader as the leading icon.
   * @default false
   */
  loading?: boolean;

  /**
   * Use rectangle design for the button, removing the large border-radius.
   * @default false
   */
  rectangle?: boolean;

  /**
   * Disable the ripple effect for the button.
   * @default false
   */
  noRipple?: boolean;

  /**
   * Sets the ripple effect's color for the button.
   * @default undefined
   */
  rippleColor?: string;

  /**
   * Use round design for the button, giving it a circular shape.
   * @default false
   */
  round?: boolean;

  /**
   * Makes the button navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id").
   *  @default undefined
   */
  to?: string;

  /**
   * Removes the button's elevation.
   * @default false
   */
  unelevated?: boolean;

  /**
   * Size of the button.
   * @default "md"
   */
  size?: QBtnSizeOptions;

  /**
   * For "a" (anchor) tag only, apply the target attribute.
   * @default undefined
   */
  target?: HTMLAnchorAttributes["target"];

  /**
   * The tag to use for the button. If not specified, a button element will be used or, if `to` is specified, an anchor tag will be used.
   */
  tag?: keyof HTMLElementTagNameMap;

  /**
   * This event is emitted when the button is clicked.
   * @default undefined
   */
  onclick?: MouseEventHandler<HTMLElement>;
}
