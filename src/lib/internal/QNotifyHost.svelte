<script lang="ts">
  import { attachNotifyPortal } from "#internal/notifyPortal.js";
  import QSnackbar from "#components/snackbar/QSnackbar.svelte";
  import type { NotifyDismiss, NotifyRequest } from "#classes/Notify.js";

  type QueuedNotification = NotifyRequest & { id: symbol };

  let queue = $state<QueuedNotification[]>([]);
  let current = $state<QueuedNotification>();
  let visible = $state(false);

  export function enqueue(request: NotifyRequest): NotifyDismiss {
    const notification = { ...request, id: Symbol() };

    queue.push(notification);
    showNext();

    return () => dismiss(notification.id);
  }

  export function clear() {
    queue.length = 0;

    if (current) {
      visible = false;
    }
  }

  function dismiss(id: symbol) {
    if (current?.id === id) {
      visible = false;
      return;
    }

    const index = queue.findIndex((notification) => notification.id === id);

    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  function showNext() {
    if (current || !queue.length) {
      return;
    }

    current = queue.shift();
    visible = true;
  }

  function handleHidden() {
    const hidden = current;
    current = undefined;

    try {
      hidden?.onHidden?.();
    } finally {
      showNext();
    }
  }
</script>

{#if current}
  <div
    data-quaff-notify-host
    popover="manual"
    style="position: fixed; inset: 0; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; pointer-events: none;"
    {@attach attachNotifyPortal}
  >
    <QSnackbar
      bind:value={visible}
      message={current.message}
      action={current.action}
      dismissible={current.dismissible}
      dismissLabel={current.dismissLabel}
      actionOnNewLine={current.actionOnNewLine}
      timeout={current.timeout}
      offset={current.offset}
      onDismiss={current.onDismiss}
      onHidden={handleHidden}
    />
  </div>
{/if}
