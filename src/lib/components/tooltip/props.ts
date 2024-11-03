import type { HTMLAttributes } from "svelte/elements";

export type HorizontalPositions = "left" | "center" | "right";
export type VerticalPositions = "top" | "middle" | "bottom";

export type Positions = `${VerticalPositions} ${HorizontalPositions}`;

export interface QTooltipProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Value holding wether the tooltip is visible or not.
   */
  value?: boolean;

  /**
   * Maximum height of the tooltip in CSS units.
   */
  maxHeight?: string;

  /**
   * Maximum width of the tooltip in CSS units.
   */
  maxWidth?: string;

  /**
   * Anchor point (or starting position) of the tooltip relative to the target.
   * @default "bottom center"
   */
  anchor?: Positions;

  /**
   * The tooltip's own position relative to the target.
   * @default "top center"
   */
  self?: Positions;

  /**
   * Offset of the tooltip from the anchor point. First value is the horizontal offset and the second is the vertical offset.
   * The offset is relative to the tooltip so a CSS value in "%" will be relative to the size of the tooltip.
   * @default [0, 0]
   */
  offset?: [number, number];

  /**
   * The delay in milliseconds before the tooltip appears.
   * @default 0
   */
  delay?: number;

  /**
   * The delay in milliseconds before the tooltip hides.
   * @default 0
   */
  hideDelay?: number;

  /**
   * Wether the tooltip is persistent (meaning it will always be visible) or not.
   * @default false
   */
  persistent?: boolean;
}
