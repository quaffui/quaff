import type { UseAlignProps } from "$lib/composables/use-align";
import type { NativeProps } from "$lib/utils/types";

export type QCardFillColors = "primary" | "secondary" | "tertiary";

export interface QCardProps extends NativeProps {
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

export interface QCardSectionProps extends NativeProps {
  /**
   * Lays out the section content horizontally.
   * @default false
   */
  horizontal?: boolean;
}

export interface QCardActionsProps extends UseAlignProps, NativeProps {
  /**
   * Lays out the action items vertically.
   * @default false
   */
  vertical?: boolean;
}
