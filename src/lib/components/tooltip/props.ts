import type { HTMLAttributes } from "svelte/elements";

export type QTooltipPosition =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

export type QTooltipOffset = { x?: number; y?: number };

export interface QTooltipProps<T extends Element | string> extends HTMLAttributes<HTMLDivElement> {
  /**
   * The target element the tooltip should be attached to. Can be an HTML element or a CSS selector. If not specified, the tooltip will be attached to the nearest Quaff component in the parent tree.
   * @default undefined
   */
  target?: T;

  /**
   * Defines the show/hide state of the tooltip. By default, the tooltip will be be shown on mouseenter and hidden on mouseleave.
   * @default false
   */
  value?: boolean;

  /**
   * Defines the position of the tooltip.
   * @default "bottom"
   */
  position?: QTooltipPosition;

  /**
   * Offset of the tooltip in pixels. Positive values move the tooltip down/right, negative values move the tooltip up/left.
   * @default { x: 0, y: 0 }
   */
  offset?: QTooltipOffset;

  /**
   * Delay in milliseconds before the tooltip appears.
   * @default 0
   */
  delay?: number;

  /**
   * Delay in milliseconds before the tooltip is hidden.
   * @default 0
   */
  hideDelay?: number;
}
