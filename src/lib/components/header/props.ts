import type { QToolbarProps } from "../toolbar/props";

export interface QHeaderProps extends QToolbarProps {
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
