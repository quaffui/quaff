import { OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QDialogPositionOptions = "default" | "top" | "right" | "bottom" | "left";

export interface QDialogProps extends OptionalModel<boolean>, HTMLAttributes<HTMLDialogElement> {
  /**
   * The position of the dialog relative to the viewport.
   */
  position?: QDialogPositionOptions;

  /**
   * Determines whether the dialog is displayed as a modal or not.
   */
  modal?: boolean;

  /**
   * Determines whether the dialog is displayed in fullscreen mode.
   */
  fullscreen?: boolean;

  /**
   * Determines whether the dialog remains persistent, not closing on click outside.
   */
  persistent?: boolean;
}
