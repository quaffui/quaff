import type { NativeProps, CSSValue } from "$lib/utils/types";

export interface QRailbarProps extends NativeProps {
  /**
   * @default 88px
   */
  width: CSSValue | number;
  /**
   * @default left
   */
  side: "left" | "right";
  /**
   * @default false
   */
  bordered: boolean;
}
