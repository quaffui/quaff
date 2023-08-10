import type { NativeProps, CSSValue } from "$lib/utils/types";

export interface QToolbarProps extends NativeProps {
  /**
   * @default false
   */
  inset: boolean;
  /**
   * @default 64px
   */
  height: CSSValue | number;
}
export interface QToolbarTitleProps extends NativeProps {
  /**
   * @default false
   */
  shrink: boolean;
}
