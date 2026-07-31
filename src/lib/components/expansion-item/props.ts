import { MaterialSymbol } from "material-symbols";
import { Snippet } from "svelte";
import { HTMLAttributes, KeyboardEventHandler, MouseEventHandler } from "svelte/elements";
import { Disableable, Labelable, Linkable, OptionalModel } from "$utils";

export interface QExpansionItemProps
  extends OptionalModel<boolean>, Labelable, Linkable, Disableable, HTMLAttributes<HTMLDivElement> {
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
   * Defaults to 300ms, or 350ms inside an expressive list.
   */
  duration?: number;

  /**
   * Hides the decorative expand icon when the whole header is the trigger.
   * A separate or linked disclosure control remains visible so the panel stays operable.
   */
  hideExpandIcon?: boolean;

  /**
   * Register the expansion item into a group, closing other items in the group when this one is opened.
   * Groups are scoped to the containing QList.
   */
  name?: string;

  /**
   * Overrides the accessible label of a separate expand/collapse button.
   * By default, a state-aware label is generated from the item label.
   */
  toggleAriaLabel?: string;

  /**
   * Makes the toggle icon the trigger for the expansion item instead of the whole header.
   * Linked items always use a separate toggle so the link and disclosure remain sibling actions.
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
   * The header uses QItem, so QItemSection components can customize its layout. The component
   * supplies the expand/collapse control; avoid placing other interactive controls in this snippet.
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

  /**
   * Event triggered when a key is pressed on the expansion item header.
   */
  onkeydown?: KeyboardEventHandler<HTMLElement>;
}
