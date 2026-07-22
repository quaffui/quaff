<script lang="ts">
  import { fly } from "svelte/transition";
  import { browser } from "$app/environment";
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import { shouldReduceMotion } from "$utils";
  import type { QSnackbarDismissReason, QSnackbarProps } from "./props";

  let {
    value = $bindable(false),
    message,
    action,
    dismissible = false,
    dismissLabel = "Dismiss",
    actionOnNewLine = false,
    timeout = 6000,
    offset = 12,
    onDismiss,
    onHidden,
    onkeydown,
    onfocusin,
    onfocusout,
    children,
    ...props
  }: QSnackbarProps = $props();

  let snackbar = $state<HTMLDivElement>();
  let wasVisible = $state(false);

  let dismissReason: QSnackbarDismissReason = "programmatic";
  let previousFocus: HTMLElement | null = null;

  const resolvedOffset = $derived(typeof offset === "number" ? `${offset}px` : offset);

  $effect.pre(() => {
    if (value === wasVisible) {
      return;
    }

    wasVisible = value;

    if (value) {
      previousFocus =
        typeof document !== "undefined" && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    } else {
      restorePreviousFocus();
      const reason = dismissReason;
      dismissReason = "programmatic";
      onDismiss?.(reason);
    }
  });

  $effect(() => {
    if (!value || action || dismissible || timeout === 0) {
      return;
    }

    const timer = setTimeout(() => hide("timeout"), Math.min(10000, Math.max(4000, timeout)));
    return () => clearTimeout(timer);
  });

  export function show() {
    value = true;
  }

  export function hide(reason: QSnackbarDismissReason = "programmatic") {
    if (!value) {
      return;
    }

    restorePreviousFocus();
    dismissReason = reason;
    value = false;
  }

  export function toggle() {
    if (value) {
      hide();
    } else {
      show();
    }
  }

  function handleAction() {
    try {
      action?.handler?.();
    } finally {
      hide("action");
    }
  }

  function restorePreviousFocus(force = false) {
    if ((force || snackbar?.contains(document.activeElement)) && previousFocus?.isConnected) {
      previousFocus.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
    onkeydown?.(event);

    if (!event.defaultPrevented && event.key === "Escape") {
      event.preventDefault();
      restorePreviousFocus(true);
      hide("dismiss");
    }
  }

  function handleFocusin(event: FocusEvent & { currentTarget: HTMLDivElement }) {
    onfocusin?.(event);

    if (
      event.relatedTarget instanceof HTMLElement &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      previousFocus = event.relatedTarget;
    }
  }

  function handleHidden() {
    onHidden?.();
  }

  Q.classes("q-snackbar", {
    bemClasses: {
      "action-new-line": action && actionOnNewLine,
    },
    classes: [props.class],
  });
</script>

{#if value}
  <div
    class="q-snackbar-positioner"
    style:--q-snackbar-offset={resolvedOffset}
    transition:fly|global={{ y: 16, duration: browser && shouldReduceMotion() ? 0 : 200 }}
    onoutroend={handleHidden}
    data-quaff-overlay
  >
    <div
      bind:this={snackbar}
      {...props}
      class="q-snackbar"
      onkeydown={handleKeydown}
      onfocusin={handleFocusin}
      {onfocusout}
      data-quaff
    >
      <div class="q-snackbar__message" role="status" aria-live="polite" aria-atomic="true">
        {#if message !== undefined}
          {message}
        {:else}
          {@render children?.()}
        {/if}
      </div>

      {#if action || dismissible}
        <div class="q-snackbar__controls">
          {#if action}
            <QBtn
              class="q-snackbar__action"
              variant="flat"
              label={action.label}
              onclick={handleAction}
            />
          {/if}

          {#if dismissible}
            <QIconBtn
              class="q-snackbar__close"
              variant="flat"
              icon="close"
              aria-label={dismissLabel}
              onclick={() => hide("dismiss")}
            />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
