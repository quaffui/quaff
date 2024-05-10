import type { UseAlignProps } from "$lib/composables/useAlign";
import type { HTMLAttributes } from "svelte/elements";

export type CardFillColors = "primary" | "secondary" | "tertiary";

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
  fill?: boolean | CardFillColors;

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
