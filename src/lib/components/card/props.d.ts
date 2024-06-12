import type { UseAlignProps } from "$lib/composables/use-align";
import type { HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export type CardFillColors = "primary" | "secondary" | "tertiary";

export interface CardProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Puts a border around the card.
   * @default false
   */
  bordered?: boolean;

  /**
   * Defines the fill color of the card.
   * @default false
   */
  fill?: boolean | CardFillColors;

  /**
   * Makes the card flat, removing its elevation.
   * @default false
   */
  flat?: boolean;

  /**
   * Adds rounded corners to the card.
   * @default false
   */
  rounded?: boolean;

  /**
   * Sets the title of the card.
   * @default undefined
   */
  title?: string | Snippet;
}

export interface CardSectionProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * Lays out the section content horizontally.
   * @default false
   */
  horizontal?: boolean;
}

export interface CardActionsProps extends UseAlignProps, NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Lays out the action items vertically.
   * @default false
   */
  vertical?: boolean;
}
