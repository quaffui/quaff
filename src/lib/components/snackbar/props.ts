import { OptionalModel } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QSnackbarDismissReason = "action" | "dismiss" | "programmatic" | "timeout";

export interface QSnackbarAction {
  /**
   * Text displayed by the snackbar action.
   */
  label: string;

  /**
   * Function called when the action is selected.
   */
  handler?: () => void;
}

export interface QSnackbarProps
  extends OptionalModel<boolean>, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Message displayed by the snackbar.
   */
  message?: string;

  /**
   * Optional button action, defined by a label and optional click handler.
   */
  action?: QSnackbarAction;

  /**
   * Shows a close button.
   *
   * @default false
   */
  dismissible?: boolean;

  /**
   * Accessible label applied to the close button's aria-label.
   *
   * @default "Dismiss"
   */
  dismissLabel?: string;

  /**
   * Places the action below the message.
   *
   * @default false
   */
  actionOnNewLine?: boolean;

  /**
   * Auto-dismiss delay in milliseconds. Values other than zero are constrained to the Material
   * Design range of 4000–10000 milliseconds. Snackbars with actions or a close button do not
   * auto-dismiss.
   *
   * @default 6000
   */
  timeout?: number;

  /**
   * Distance from the bottom viewport edge in pixels or as a CSS length.
   *
   * @default 12
   */
  offset?: number | string;

  /**
   * Called when dismissal starts.
   */
  onDismiss?: (reason: QSnackbarDismissReason) => void;

  /**
   * Called after the snackbar has left the screen.
   */
  onHidden?: () => void;

  /**
   * Message used when no message prop is supplied.
   */
  children?: Snippet;
}
