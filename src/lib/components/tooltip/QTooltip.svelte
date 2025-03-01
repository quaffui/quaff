<script lang="ts" generics="T extends HTMLElement | string">
  import { mount, unmount, onMount, untrack } from "svelte";
  import { addEventListener } from "$lib/utils/events";
  import QTooltipBase from "./QTooltipBase.svelte";
  import type { QTooltipProps } from "./props";

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

  let tooltipHelperEl = $state<HTMLDivElement>();
  let tooltipEl = $state<HTMLDivElement>();

  let realTarget = $state<HTMLElement>();

  let timerShow = $state<ReturnType<typeof setTimeout> | null>(null);
  let timerHide = $state<ReturnType<typeof setTimeout> | null>(null);

  let mountedTooltip: ReturnType<typeof mountTooltip> | null = null;

  let targetMouseEnterListener: ReturnType<typeof addEventListener> | null = null;
  let targetMouseLeaveListener: ReturnType<typeof addEventListener> | null = null;
  let tooltipMouseEnterListener: ReturnType<typeof addEventListener> | null = null;
  let tooltipMouseLeaveListener: ReturnType<typeof addEventListener> | null = null;
  let windowWheelListener: ReturnType<typeof addEventListener> | null = null;

  const id = Date.now();

  $effect(() => {
    value ? untrack(show) : untrack(hide);
  });

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

    targetMouseEnterListener = addEventListener(realTarget, "mouseenter", show);
    targetMouseLeaveListener = addEventListener(realTarget, "mouseleave", hide);

    return () => {
      targetMouseEnterListener?.remove();
      targetMouseLeaveListener?.remove();

      tooltipMouseEnterListener?.remove();
      tooltipMouseLeaveListener?.remove();

      windowWheelListener?.remove();

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

      tooltipEl = (document.getElementById(`qtooltip-${id}`) as HTMLDivElement) || undefined;
      tooltipMouseEnterListener = addEventListener(tooltipEl, "mouseenter", abortHide);
      tooltipMouseLeaveListener = addEventListener(tooltipEl, "mouseleave", hide);

      windowWheelListener = addEventListener(window, "wheel", hide);

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
      tooltipMouseEnterListener?.remove();

      if (!mountedTooltip) {
        return;
      }

      unmount(mountedTooltip);

      windowWheelListener?.remove();

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
        id: `qtooltip-${id}`,
        ...props,
      },
    });
  }
</script>

{#if !target}
  <div bind:this={tooltipHelperEl} class="q-tooltip__helper"></div>
{/if}
