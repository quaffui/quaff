import type { NativeProps, CssValue } from "$lib/utils";
import type { HTMLAttributes, SVGAttributes } from "svelte/elements";

export interface QLinearProgressProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * @default 0
   */
  value: number;
  /**
   * @default left
   */
  from?: "left" | "right";
  /**
   * @default false
   */
  rounded?: boolean;
}

export interface QCircularProgressProps extends NativeProps, SVGAttributes<SVGSVGElement> {
  /**
   * @default 0
   */
  value: number;
  /**
   * @default false
   */
  indeterminate?: boolean;
  /**
   * @default 2em
   */
  size?: CssValue | number;
  /**
   * @default undefined
   */
  color?: string;
  /**
   * @default 5
   */
  thickness?: number;
}
