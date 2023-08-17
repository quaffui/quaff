import type { QToolbarProps } from "../toolbar/props";

export interface QHeaderProps extends QToolbarProps {
  /**
   * @default false
   */
  inset?: boolean;
  /**
   * @default false
   */
  elevate?: boolean;
  /**
   * @default false
   */
  border?: boolean;
}
