import type { NativeProps, QuaffSizes } from "$utils/types";

export type QBtnSizeOptions = Exclude<QuaffSizes, "xs">;

export interface QBtnProps extends NativeProps {
  /**
   * Puts the button in a disabled state, making it unclickable.
   * @default false
   */
  disable?: boolean;

  /**
   * Use flat design for the button, removing its elevation and background-color.
   * @default false
   */
  flat?: boolean;

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
   * Use outline design for the button, adding a border around it.
   * @default false
   */
  outline?: boolean;

  /**
   * Use rectangle design for the button, removing the large border-radius.
   * @default false
   */
  rectangle?: boolean;

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
   * @default md
   */
  size?: QBtnSizeOptions;
}
