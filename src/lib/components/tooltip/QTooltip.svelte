<script lang="ts" generics="T extends HTMLElement | string">
  import { mount, onMount, unmount, untrack } from "svelte";
  import { on } from "svelte/events";
  import { type Attachment, createAttachmentKey } from "svelte/attachments";
  import QTooltipBase from "./QTooltipBase.svelte";
  import type { QTooltipProps } from "./props";

  // #region:    --- Props
  let {
    target,
    value = $bindable(false),
    position = "bottom",
    offset = { x: 0, y: 0 },
    delay = 250,
    hideDelay = 250,
    children,
    trigger,
    ...props
  }: QTooltipProps<T> = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let mountedTooltip: ReturnType<typeof mountTooltip> | null = null;

  let removeTargetMouseEnterListener: (() => void) | undefined;
  let removeTargetMouseLeaveListener: (() => void) | undefined;
  let removeTooltipMouseEnterListener: (() => void) | undefined;
  let removeTooltipMouseLeaveListener: (() => void) | undefined;
  let removeWindowWheelListener: (() => void) | undefined;

  let tooltipEl: HTMLDivElement | undefined;
  let realTarget: HTMLElement | undefined;
  let timerShow: ReturnType<typeof setTimeout> | null = null;
  let timerHide: ReturnType<typeof setTimeout> | null = null;

  const id = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Effects
  $effect(() => {
    value ? untrack(show) : untrack(hide);
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    if (!target) {
      return;
    }
    realTarget =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target) || undefined
        : target;

    if (!realTarget) {
      return;
    }

    return attachTooltip(realTarget);
  });
  // #endregion: --- Lifecycle

  // #region:    --- Methods
  export function show() {
    if (timerHide) {
      clearTimeout(timerHide);
      timerHide = null;

      return;
    }

    if (mountedTooltip) {
      return;
    }

    if (timerShow) {
      clearTimeout(timerShow);
    }

    timerShow = setTimeout(() => {
      timerShow = null;
      mountedTooltip = mountTooltip();

      tooltipEl = (document.getElementById(`q-tooltip-${id}`) as HTMLDivElement) || undefined;
      if (tooltipEl) {
        removeTooltipMouseEnterListener = on(tooltipEl, "mouseenter", abortHide);
        removeTooltipMouseLeaveListener = on(tooltipEl, "mouseleave", hide);
      }

      removeWindowWheelListener = on(window, "wheel", hide);

      if (!value) {
        value = true;
      }

      return;
    }, delay);
  }

  export function hide() {
    if (timerShow) {
      clearTimeout(timerShow);
      timerShow = null;

      return;
    }

    if (!mountedTooltip) {
      return;
    }

    if (timerHide) {
      clearTimeout(timerHide);
      timerHide = null;
    }

    timerHide = setTimeout(() => {
      removeTooltipMouseEnterListener?.();

      if (!mountedTooltip) {
        return;
      }

      unmount(mountedTooltip);

      removeWindowWheelListener?.();

      mountedTooltip = null;
      timerHide = null;

      if (value) {
        value = false;
      }
    }, hideDelay);
  }

  export function toggle() {
    value = !value;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  const attachTooltip: Attachment<HTMLElement> = (element) => {
    realTarget = element;
    removeTargetMouseEnterListener = on(element, "mouseenter", show);
    removeTargetMouseLeaveListener = on(element, "mouseleave", hide);

    return () => {
      removeTargetMouseEnterListener?.();
      removeTargetMouseLeaveListener?.();

      removeTooltipMouseEnterListener?.();
      removeTooltipMouseLeaveListener?.();

      removeWindowWheelListener?.();

      if (mountedTooltip) {
        unmount(mountedTooltip);
      }

      if (timerShow) {
        clearTimeout(timerShow);
      }

      if (timerHide) {
        clearTimeout(timerHide);
      }
    };
  };

  function abortHide() {
    if (timerHide) {
      clearTimeout(timerHide);
      timerHide = null;
    }
  }

  function mountTooltip() {
    if (!realTarget) {
      return null;
    }

    return mount(QTooltipBase, {
      target: document.body,
      props: {
        target: realTarget,
        value: true,
        position,
        offset,
        children,
        id: `q-tooltip-${id}`,
        ...props,
      },
    });
  }
  // #endregion: --- Functions
</script>

{#if !target && trigger}
  {@render trigger({ [createAttachmentKey()]: attachTooltip })}
{/if}
