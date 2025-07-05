import type { MaterialSymbol } from "material-symbols";
import type { HTMLAttributes, MouseEventHandler } from "svelte/elements";

export type MenuItem =
  | Q.StringWithSuggestions<"separator">
  | {
      /**
       * The text displayed on the menu item.
       */
      label: string;
      /**
       * The leading icon of the menu item.
       */
      icon?: MaterialSymbol;
      /**
       * The trailing icon of the menu item.
       */
      trailingIcon?: MaterialSymbol;
      /**
       * Disables the menu item, making it unclickable.
       */
      disabled?: boolean;
      /**
       * The tooltip text to display when hovering over the menu item.
       * You can provide a string or an object with label and position.
       * By default, the tooltip will be displayed on the right side.
       */
      tooltip?: string | { label?: string; position?: "left" | "right" };
      /**
       * Click event handler for the menu item.
       */
      onclick?: MouseEventHandler<HTMLElement>;
    };

export type MenuPosition = "top" | "right" | "bottom" | "left";

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Target element to attach the menu to.
   * If not provided, the menu will be positioned relative to its closest Quaff parent component.
   * This can be a CSS selector or an HTML element.
   */
  target?: string | HTMLElement;

  /**
   * Whether the menu is open or closed.
   */
  value?: boolean;

  /**
   * Array of menu items. You can easily add separators by using the string "separator", and section titles by using any other string.
   *
   * @default []
   */
  items: MenuItem[];

  /**
   * The position of the menu relative to the target element.
   *
   * @default "bottom"
   */
  position?: MenuPosition;

  /**
   * Whether the menu should cover the target element.
   * When this prop is set to true, only "top" and "bottom" positions will change the position of the menu.
   * Setting the position to "left" or "right" will look the same as "bottom" when cover is true.
   *
   * @default false
   */
  cover?: boolean;

  /**
   * Whether the menu should fit the width of the target element.
   * This is useful for dropdown menus that should align with the target element.
   *
   * @default false
   */
  fit?: boolean;
}
