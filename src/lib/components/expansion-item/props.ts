import { MaterialSymbol } from "material-symbols";
import { Snippet } from "svelte";
import { HTMLDetailsAttributes, MouseEventHandler } from "svelte/elements";
import { Disableable, Labelable, Linkable, OptionalModel } from "$utils";

export interface QExpansionItemProps
  extends OptionalModel<boolean>, Labelable, Linkable, Disableable, HTMLDetailsAttributes {
  /**
   * The icon to display in the header of the expansion item.
   */
  icon?: MaterialSymbol;

  /**
   * The caption, displayed below the label in the header.
   */
  caption?: string;

  /**
   * The icon to use as the toggle icon for the expansion item.
   * If not provided, a chevron icon will be used.
   */
  expandIcon?: MaterialSymbol;

  /**
   * The icon to use as the collapse icon for the expanded item.
   * If not provided, the expandIcon will be rotated 180 degrees when the item is expanded.
   */
  expandedIcon?: MaterialSymbol;

  /**
   * Whether the expansion item is initially expanded.
   */
  defaultOpened?: boolean;

  /**
   * Use the dense style for the expansion item, reducing its height.
   */
  dense?: boolean;

  /**
   * Duration for the expansion animation in milliseconds.
   */
  duration?: number;

  /**
   * Whether to hide the expand icon.
   */
  hideExpandIcon?: boolean;

  /**
   * Register the expansion item into a group, closing other items in the group when this one is opened.
   * This is often called "accordion" behavior. This name is used to identify the group of items
   * and should thus be unique.
   */
  name?: string;

  /**
   * The aria-label for the toggle button of the expansion item for accessibility.
   */
  toggleAriaLabel?: string;

  /**
   * Makes the toggle icon the trigger for the expansion item instead of the whole header.
   * This is useful when using the expansion item as link, so the icon allows to expand/collapse the item
   * while the header changes the route.
   */
  expandIconToggle?: boolean;

  /**
   * Prevents the rotation of the expand icon when the item is expanded.
   * This is useful when using a custom icon that does not need to be rotated.
   */
  noRotateExpandIcon?: boolean;

  /**
   * Disables the ripple effect on the expansion item.
   * This is useful when the item is used as a link and you want to prevent the ripple effect.
   *
   * @default false
   */
  noRipple?: boolean;

  /**
   * The summary snippet, to override the default header.
   * As the header uses QItem, you can easily use QItemSection components to customize the header layout.
   */
  summary?: Snippet<
    [{ expanded: boolean; show: () => void; hide: () => void; toggle: () => void }]
  >;

  /**
   * Event triggered when the expansion icon is clicked.
   */
  onExpandIconClick?: MouseEventHandler<HTMLElement>;

  /**
   * Event triggered when the expansion item is clicked.
   */
  onclick?: MouseEventHandler<HTMLElement>;
}
