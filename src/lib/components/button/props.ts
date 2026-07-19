import type { Clickable, Labelable, Linkable, QSize } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QBtnSizeOptions = Exclude<QSize, "none">;
export type QBtnIcon = MaterialSymbol | Snippet | `img:${string}`;

export type QBtnVariantOptions = "elevated" | "filled" | "tonal" | "outlined" | "flat";

interface QBtnVariantProps {
  /**
   * Choose the variant for the button. If a variant is specified, it overwrites all other variants defined with boolean attributes. If no variant is specified using this prop or boolean props, labeled buttons use `elevated` and icon-only buttons use `flat`.
   */
  variant?: QBtnVariantOptions;

  /**
   * Equivalent to `variant="filled"`. Overwritten by `variant` but overwrites `tonal`, `outlined` and `flat`.
   */
  filled?: boolean;

  /**
   * Equivalent to `variant="tonal"`. Overwritten by `variant` and `filled` but overwrites `outlined` and `flat`.
   */
  tonal?: boolean;

  /**
   * Equivalent to `variant="outlined"`. Overwritten by `variant`, `filled` and `tonal` but overwrites `flat`.
   */
  outlined?: boolean;

  /**
   * Equivalent to `variant="flat"`. Overwritten by any other variant if defined with the `variant` prop or other boolean variant props.
   */
  flat?: boolean;
}

interface QBtnCommonProps extends Clickable, Linkable, QBtnVariantProps {
  /**
   * Uses the Material 3 Expressive button sizes, shapes, and motion for this button. Expressive mode can also be enabled globally through `Quaff.init()`.
   *
   * @default false
   */
  expressive?: boolean;

  /**
   * Icon to display on the leading edge of the button.
   */
  icon?: QBtnIcon;

  /**
   * Puts the button in a loading state, adding a loader as the leading icon.
   */
  loading?: boolean;

  /**
   * Disables the button's focus ring.
   *
   * @default false
   */
  noFocusRing?: boolean;

  /**
   * Uses a rectangular shape for a standard button.
   *
   * @default false
   */
  rectangle?: boolean;

  /**
   * Uses a circular shape for a standard icon-only button.
   *
   * @default false
   */
  round?: boolean;

  /**
   * Controls the selection state of a toggle button. Supplying this prop enables toggle behavior, except on flat labeled buttons. This property is bindable.
   */
  selected?: boolean;

  /**
   * The shape used when `expressive` is enabled.
   */
  shape?: "round" | "squared";

  /**
   * Size of the button.
   */
  size?: QBtnSizeOptions;

  /**
   * Removes the button's elevation.
   */
  unelevated?: boolean;

  /**
   * The tag to use for the button. If not specified, a button element will be used or, if `href` or `to` is specified, an anchor tag will be used.
   */
  tag?: keyof HTMLElementTagNameMap;
}

export interface QBtnProps extends QBtnCommonProps, Labelable, HTMLAttributes<HTMLButtonElement> {
  /**
   * Sets the color of the button.
   */
  color?: string;
}

export interface QIconBtnProps extends QBtnCommonProps, HTMLAttributes<HTMLButtonElement> {
  /**
   * Sets the color of the button.
   */
  color?: string;

  /**
   * Defines the width of an expressive icon button.
   */
  width?: "narrow" | "default" | "wide";
}
