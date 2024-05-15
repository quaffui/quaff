import type { HTMLAttributes } from "svelte/elements";

export type QChipKindOptions = "assist" | "filter" | "input" | "suggestion";
export type QChipFillOptions =
  | "primary"
  | "secondary"
  | "tertiary"
  | "neutral"
  | "neutral-variant"
  | "error";

export type QChipSizeOptions = Exclude<Q.Size, "xs" | "xl" | "none">;

export interface QChipProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The chip's kind. It will control the chip's style and behavior.
   * @default undefined
   */
  kind?: QChipKindOptions;

  /**
   * The chip's text content. Will overwrite the default slot.
   * @default undefined
   */
  label?: string;

  /**
   * Name of the leading icon to use for the chip. If starts with "img:", will be used as an image src instead.
   * @default undefined
   */
  icon?: string;

  /**
   * Name of the trailing icon to use for the chip.
   * @default undefined
   */
  trailingIcon?: string;

  /**
   * Puts the chip in a disabled state, making it unactivable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Only for filter chips. Controls wether the chip is selected or not.
   * @default false
   */
  selected?: boolean;

  /**
   * Elevates the button, giving it box-shadow and a background color.
   * @default false
   */
  elevated?: boolean;

  /**
   * Use round design for the chip, adding a large border-radius to it.
   * @default false
   */
  round?: boolean;

  /**
   * Disable the ripple effect for the chip.
   * @default false
   */
  noRipple?: boolean;

  /**
   * Size of the chip.
   * @default sm
   */
  size?: QChipSizeOptions;
}
