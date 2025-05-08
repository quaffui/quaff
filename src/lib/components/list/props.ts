import type { RouterProps } from "$utils";
import type { Snippet } from "svelte";
import type { QSeparatorHorizontalProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

export interface QListProps extends HTMLAttributes<HTMLElement> {
  /**
   * Adds a border around the list.
   *
   * @default false
   */
  bordered?: boolean;

  /**
   * Makes the borders of the list rounded when bordered is true.
   *
   * @default false
   */
  roundedBorders?: boolean;

  /**
   * Makes all the items in the list more compact.
   *
   * @default false
   */
  dense?: boolean;

  /**
   * Adds separators between list items.
   *
   * @default false
   */
  separator?: boolean;

  /**
   * Options for the separators. These will be applied to all separators in the list.
   *
   * @default undefined
   */
  separatorOptions?: Omit<QSeparatorHorizontalProps, "vertical">;

  /**
   * Adds padding to the list container.
   *
   * @default true
   */
  padding?: boolean;

  /**
   * HTML tag to be used for the list container.
   *
   * @default "div"
   */
  tag?: string;

  /**
   * The class to apply to items that are active. For more granular control, you can also use the `activeClass` prop on each QItem.
   *
   * @default undefined
   */
  activeClass?: string;
}

export interface QItemProps extends RouterProps, HTMLAttributes<HTMLElement> {
  /**
   * HTML tag to be used for the list item.
   *
   * @default "div"
   */
  tag?: string;

  /**
   * Indicates if the item is currently active.
   *
   * @default false
   */
  active?: boolean;

  /**
   * Makes the item clickable and adds hover effects.
   *
   * @default false
   */
  clickable?: boolean;

  /**
   * Makes the item more compact.
   *
   * @default false
   */
  dense?: boolean;

  /**
   * Disables the ripple effect when clicking the item.
   *
   * @default false
   */
  noRipple?: boolean;

  /**
   * Tab index for keyboard navigation.
   *
   * @default 0
   */
  tabindex?: HTMLAttributes<HTMLElement>["tabindex"];

  /**
   * Target attribute for anchor tags when using router links.
   *
   * @default undefined
   */
  target?: HTMLAnchorAttributes["target"];
}

export type QItemSectionTypes =
  | "thumbnail"
  | "video"
  | "avatar"
  | "toggle"
  | "icon"
  | "trailingIcon"
  | "trailingText"
  | "content";

export interface QItemSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Type of the section, determines its layout and styling.
   *
   * @default "content"
   */
  type?: QItemSectionTypes;

  /**
   * Main content or title of the section. By default, inherits the content of the children snippet.
   *
   * @default children
   */
  headline?: Snippet;

  /**
   * First line of supporting text.
   *
   * @default undefined
   */
  line1?: Snippet;

  /**
   * Second line of supporting text.
   *
   * @default undefined
   */
  line2?: Snippet;

  /**
   * Third line of supporting text.
   *
   * @default undefined
   */
  line3?: Snippet;
}
