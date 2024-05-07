import type { HTMLAttributes, MouseEventHandler } from "svelte/elements";

export type QBtnSizeOptions = Exclude<__Quaff__.Size, "xs">;

export type QBtnDesignOptions = "elevated" | "filled" | "tonal" | "outlined" | "flat";

export interface QBtnProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Puts the button in a disabled state, making it unclickable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Choose the design for the button.
   * @default "elevated"
   */
  design?: QBtnDesignOptions;

  /**
   * Name of the leading icon to use for the button.
   * @default undefined
   */
  icon?: string;

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
   * This event is emitted when the button is clicked.
   * @default undefined
   */
  onclick?: MouseEventHandler;
}
