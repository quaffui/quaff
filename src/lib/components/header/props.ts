import { HTMLAttributes } from "svelte/elements";

export interface QHeaderProps extends HTMLAttributes<HTMLElement> {
  /**
   * Adds horizontal padding to the toolbar content.
   *
   * @default false
   */
  inset?: boolean;
  /**
   * Adds a border to the toolbar to separate it from the main content.
   *
   * @default false
   */
  border?: boolean;
  /**
   * @default false
   */
  elevated?: boolean;
  /**
   * @default false
   */
  bordered?: boolean;
  /**
   * @default 64
   */
  height?: number;
  /**
   * @default false
   */
  reveal?: boolean;
  /**
   * @default 250
   */
  revealOffset?: number;
}
