import type { NativeProps, CSSValue } from "$utils/types";

export interface QLinearProgressProps extends NativeProps {
  /**
   * @default 0
   */
  value: number;
  /**
   * @default left
   */
  from: "left" | "right";
  /**
   * @default false
   */
  rounded: boolean;
}

export interface QCircularProgressProps extends NativeProps {
  /**
   * @default 0
   */
  value: number;
  /**
   * @default false
   */
  indeterminate: boolean;
  /**
   * @default 2em
   */
  size: CSSValue | number;
  /**
   * @default undefined
   */
  color?: string;
  /**
   * @default 5
   */
  thickness: number;
}
