<script lang="ts" generics="T extends HTMLElement | string">
  import { mount, onMount, unmount, untrack } from "svelte";
  import { on } from "svelte/events";
  import QTooltipBase from "./QTooltipBase.svelte";
  import type { QTooltipProps } from "./props";

  // #region:    --- Props
  let {
    target,
    value = $bindable(false),
    position = "bottom",
    offset = { x: 0, y: 0 },
    delay = 50,
    hideDelay = 50,
    children,
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

  const id = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let tooltipHelperEl = $state<HTMLDivElement>();
  let tooltipEl = $state<HTMLDivElement>();

  let realTarget = $state<HTMLElement>();

  let timerShow = $state<ReturnType<typeof setTimeout> | null>(null);
  let timerHide = $state<ReturnType<typeof setTimeout> | null>(null);
  // #endregion: --- Reactive variables

  // #region:    --- Effects
  $effect(() => {
    value ? untrack(show) : untrack(hide);
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    if (target) {
      realTarget =
        typeof target === "string"
          ? document.querySelector<HTMLElement>(target) || undefined
          : target;
    } else {
      let parent = tooltipHelperEl?.parentElement || null;

      while (parent) {
        if (parent.attributes.getNamedItem("data-quaff")) {
          realTarget = parent;
          break;
        } else {
          parent = parent.parentElement;
        }
      }
    }

    if (realTarget) {
      removeTargetMouseEnterListener = on(realTarget, "mouseenter", show);
      removeTargetMouseLeaveListener = on(realTarget, "mouseleave", hide);
    }

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

{#if !target}
  <div bind:this={tooltipHelperEl} class="q-tooltip__helper"></div>
{/if}
