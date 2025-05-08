import type { NativeProps } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QDialogPositionOptions = "default" | "top" | "right" | "bottom" | "left";

export interface QDialogProps extends NativeProps, HTMLAttributes<HTMLDialogElement> {
  /**
   * The value indicating whether the dialog is visible or hidden.
   * @default true
   */
  value?: boolean;

  /**
   * The position of the dialog relative to the viewport.
   * @default "default"
   */
  position?: QDialogPositionOptions;

  /**
   * Determines whether the dialog is displayed as a modal or not.
   * @default false
   */
  modal?: boolean;

  /**
   * Determines whether the dialog is displayed in fullscreen mode.
   * @default false
   */
  fullscreen?: boolean;

  /**
   * Determines whether the dialog remains persistent, not closing on click outside.
   * @default false
   */
  persistent?: boolean;
}
