import type { UseAlignProps } from "$lib/composables";
import type { NativeProps } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export type QCardFillColors = "primary" | "secondary" | "tertiary";

export interface QCardProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Puts a border around the card.
   * @default false
   */
  bordered?: boolean;

  /**
   * Defines the fill color of the card.
   * @default undefined
   */
  fill?: boolean | QCardFillColors;

  /**
   * Makes the card flat, removing its elevation.
   * @default false
   */
  flat?: boolean;

  /**
   * Adds rounded corners to the card.
   * @default false
   */
  round?: boolean;

  /**
   * Sets the title of the card.
   * @default undefined
   */
  title?: string;
}

export interface QCardSectionProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * Lays out the section content horizontally.
   * @default false
   */
  horizontal?: boolean;
}

export interface QCardActionsProps extends UseAlignProps, NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Lays out the action items vertically.
   * @default false
   */
  vertical?: boolean;
}
