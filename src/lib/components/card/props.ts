import type { UseAlignProps } from "$composables";
import type { HTMLAttributes } from "svelte/elements";

export type QCardFillColors = "primary" | "secondary" | "tertiary";

export interface QCardProps extends HTMLAttributes<HTMLElement> {
  /**
   * Adds a border around the card.
   * @default false
   */
  bordered?: boolean;

  /**
   * Defines the fill color of the card.
   * @default false
   */
  fill?: boolean | QCardFillColors;

  /**
   * Use the flat design for the card, removing its elevation.
   * @default false
   */
  flat?: boolean;

  /**
   * Adds border radius to the card to round its corners.
   * @default false
   */
  rounded?: boolean;
}

export interface QCardSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lays out the section content horizontally.
   * @default false
   */
  horizontal?: boolean;
}

export interface QCardActionsProps extends UseAlignProps, HTMLAttributes<HTMLElement> {
  /**
   * Lays out the action items vertically.
   * @default false
   */
  vertical?: boolean;
}
