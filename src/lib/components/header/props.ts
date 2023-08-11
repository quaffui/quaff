import type { CssValue, NativeProps } from "$lib/utils/types";

export interface QHeaderProps extends NativeProps {
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
