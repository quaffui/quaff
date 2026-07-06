import { Snippet } from "svelte";
import { Attachment } from "svelte/attachments";
import { OptionalModel } from "$utils";
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

export interface QTooltipProps<T extends Element | string>
  extends OptionalModel<boolean>, HTMLAttributes<HTMLDivElement> {
  /**
   * The target element the tooltip should be attached to. Can be an HTML element or a CSS selector. If not specified, the tooltip will be attached to the nearest Quaff component in the parent tree.
   */
  target?: T;

  /**
   * Defines the position of the tooltip.
   */
  position?: QTooltipPosition;

  /**
   * Offset of the tooltip in pixels. Positive values move the tooltip down/right, negative values move the tooltip up/left.
   */
  offset?: QTooltipOffset;

  /**
   * Delay in milliseconds before the tooltip appears.
   */
  delay?: number;

  /**
   * Delay in milliseconds before the tooltip is hidden.
   */
  hideDelay?: number;

  /**
   * Snippet holding the trigger element/component. Its scope contains a Svelte attachment that should be spread on the trigger element.
   */
  trigger?: Snippet<[{ [k: symbol]: Attachment<HTMLElement> }]>;
}
