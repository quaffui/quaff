import type { NativeProps, QuaffSizes } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export type QChipSizeOptions = Exclude<QuaffSizes, "xs" | "xl">;

export interface QChipProps extends NativeProps, HTMLAttributes<HTMLAnchorElement> {
  /**
   * The content inside the chip. Will overwrite the default slot.
   * @default undefined
   */
  content?: string;

  /**
   * Name of the leading icon to use for the chip. If starts with "img:", will be used as an image src instead.
   * @default undefined
   */
  icon?: string;

  /**
   * Name of the trailing icon to use for the chip. If starts with "img:", will be used as an image src instead.
   * @default undefined
   */
  iconRight?: string;

  /**
   * Puts the chip in a disabled state, making it unclickable.
   * @default false
   */
  disable?: boolean;

  /**
   * Makes leading and trailing images responsive, making them take more space.
   * @default false
   */
  responsive?: boolean;

  /**
   * If true, the chip will display its content vertically.
   * @default false
   */
  vertical?: boolean;

  /**
   * Use round design for the chip, adding a large border-radius to it.
   * @default false
   */
  round?: boolean;

  /**
   * Use outline design for the chip, adding a border around it.
   * @default false
   */
  outlined?: boolean;

  /**
   * Disable the ripple effect for the chip.
   * @default false
   */
  noRipple?: boolean;

  /**
   * Size of the chip.
   * @default small
   */
  size?: QChipSizeOptions;

  /**
   * Tabindex of the chip.
   * @default undefined
   */
  tabindex?: number;

  /**
   * Makes the chip navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id").
   * @default undefined
   */
  href?: string;
}
