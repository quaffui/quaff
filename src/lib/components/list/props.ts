import type { Disableable, Linkable, WithActiveAttrs } from "$utils";
import type { Snippet } from "svelte";
import type { QSeparatorHorizontalProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

export type QListSelection = "single" | "multiple";

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
   * Applies Material 3 Expressive list styling.
   */
  expressive?: boolean;

  /**
   * Separates expressive list items with a small gap.
   */
  segmented?: boolean;

  /**
   * Enables single- or multiple-selection list semantics.
   * Selection state is controlled with QItem's active prop.
   */
  selection?: QListSelection;

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
   * Applies the dragged visual state.
   */
  dragged?: boolean;

  /**
   * Enables native dragging and applies the dragged visual state while dragging.
   */
  draggable?: boolean;

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

export interface QItemSectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Type of the section, determines its layout and styling.
   */
  type?: QItemSectionTypes;

  /**
   * Renders the content section as the primary button in a multi-action list item.
   */
  action?: boolean;

  /**
   * Marks this section as a pointer drag handle.
   */
  dragHandle?: boolean;

  /**
   * Leading content included in the primary action target.
   */
  leading?: Snippet;

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
