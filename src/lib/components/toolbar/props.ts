import type { NativeProps, CssValue } from "$lib/utils/types";

export interface QToolbarProps extends NativeProps {
  /**
   * @default false
   */
  inset: boolean;
  /**
   * @default false
   */
  border: boolean;
  /**
   * @default false
   */
  elevate: boolean;
  /**
   * @default 64px
   */
  height: CssValue | number;
}
export interface QToolbarTitleProps extends NativeProps {
  /**
   * @default false
   */
  shrink: boolean;
}
