import type { UseAlignProps } from "$composables";
import { Borderable } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QCardFillColors = "primary" | "secondary" | "tertiary";

export interface QCardProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Defines the fill color of the card.
   */
  fill?: boolean | QCardFillColors;

  /**
   * Use the flat design for the card, removing its elevation.
   */
  flat?: boolean;

  /**
   * Adds border radius to the card to round its corners.
   */
  rounded?: boolean;
}

export interface QCardSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Lays out the section content horizontally.
   */
  horizontal?: boolean;
}

export interface QCardActionsProps extends UseAlignProps, HTMLAttributes<HTMLElement> {
  /**
   * Lays out the action items vertically.
   */
  vertical?: boolean;
}
