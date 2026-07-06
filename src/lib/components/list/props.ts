import type { Disableable, Linkable, WithActiveAttrs } from "$utils";
import type { Snippet } from "svelte";
import type { QSeparatorHorizontalProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

export interface QListProps extends WithActiveAttrs, HTMLAttributes<HTMLElement> {
  /**
   * Adds a border around the list.
   */
  bordered?: boolean;

  /**
   * Removes the rounded borders when bordered is true.
   */
  noRound?: boolean;

  /**
   * Makes all the items in the list more compact.
   */
  dense?: boolean;

  /**
   * Adds separators between list items.
   */
  separator?: boolean;

  /**
   * Options for the separators. These will be applied to all separators in the list.
   *
   */
  separatorOptions?: Omit<QSeparatorHorizontalProps, "vertical">;

  /**
   * Adds padding to the list container.
   */
  padding?: boolean;

  /**
   * HTML tag to be used for the list container.
   */
  tag?: string;
}

export interface QItemProps
  extends Linkable, Disableable, WithActiveAttrs, HTMLAttributes<HTMLElement> {
  /**
   * HTML tag to be used for the list item.
   */
  tag?: string;

  /**
   * Indicates if the item is currently active.
   */
  active?: boolean;

  /**
   * Makes the item clickable and adds hover effects.
   */
  clickable?: boolean;

  /**
   * Makes the item more compact.
   */
  dense?: boolean;

  /**
   * Disables the ripple effect when clicking the item.
   */
  noRipple?: boolean;

  /**
   * Target attribute for anchor tags when using router links.
   */
  target?: HTMLAnchorAttributes["target"];
}

export type QItemSectionTypes =
  | "thumbnail"
  | "video"
  | "avatar"
  | "side"
  | "toggle"
  | "icon"
  | "trailingIcon"
  | "trailingText"
  | "content";

export interface QItemSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Type of the section, determines its layout and styling.
   */
  type?: QItemSectionTypes;

  /**
   * Main content or title of the section. By default, inherits the content of the children snippet.
   */
  headline?: Snippet;

  /**
   * First line of supporting text.
   */
  line1?: Snippet;

  /**
   * Second line of supporting text.
   */
  line2?: Snippet;

  /**
   * Third line of supporting text.
   */
  line3?: Snippet;
}
