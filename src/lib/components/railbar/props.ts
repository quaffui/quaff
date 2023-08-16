import type { NativeProps, CssValue } from "$lib/utils/types";

export interface QRailbarProps extends NativeProps {
  /**
   * @default 88px
   */
  width?: CssValue | number;
  /**
   * @default left
   */
  side?: "left" | "right";
  /**
   * @default false
   */
  bordered?: boolean;
}
