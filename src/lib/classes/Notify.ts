import { mount } from "svelte";
import QNotifyHost from "$internal/QNotifyHost.svelte";
import type { QSnackbarAction, QSnackbarDismissReason } from "$components/snackbar/props";

export interface NotifyOptions {
  /**
   * Message displayed by the notification.
   */
  message: string;

  /**
   * Action buttons, each defined by a label and optional click handler. Material Design allows at
   * most one.
   */
  actions?: readonly QSnackbarAction[];

  /**
   * Shows a close button.
   */
  dismissible?: boolean;

  /**
   * Accessible label applied to the close button's aria-label.
   */
  dismissLabel?: string;

  /**
   * Places the action below the message.
   */
  actionOnNewLine?: boolean;

  /**
   * Auto-dismiss delay in milliseconds. Use zero for a persistent notification.
   */
  timeout?: number;

  /**
   * Distance from the bottom viewport edge in pixels or as a CSS length.
   */
  offset?: number | string;

  /**
   * Called when dismissal starts.
   */
  onDismiss?: (reason: QSnackbarDismissReason) => void;

  /**
   * Called after the notification has left the screen.
   */
  onHidden?: () => void;
}

export type NotifyDefaults = Partial<Omit<NotifyOptions, "message">>;
export type NotifyDismiss = () => void;

export interface NotifyRequest extends Omit<NotifyOptions, "actions"> {
  action?: QSnackbarAction;
}

let host: ReturnType<typeof mountHost> | undefined;
let defaults: NotifyDefaults = {};

function mountHost() {
  return mount(QNotifyHost, { target: document.body });
}

function getHost() {
  if (typeof document === "undefined" || !document.body) {
    return;
  }

  host ??= mountHost();
  return host;
}

class NotifyController {
  create(options: string | NotifyOptions): NotifyDismiss {
    const resolved: NotifyOptions = {
      ...defaults,
      ...(typeof options === "string" ? { message: options } : options),
    };

    if (resolved.actions && resolved.actions.length > 1) {
      throw new Error("Notify supports one action per Material Design snackbar.");
    }

    const { actions, ...request } = resolved;

    return (
      getHost()?.enqueue({
        ...request,
        action: actions?.[0],
      }) ?? (() => {})
    );
  }

  setDefaults(options: NotifyDefaults = {}) {
    defaults = { ...options };
  }

  clear() {
    host?.clear();
  }
}

export default new NotifyController();
