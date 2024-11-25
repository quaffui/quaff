<script lang="ts" generics="T extends HTMLElement | string">
  import { mount, unmount, onMount } from "svelte";
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

  let timerShow = $state<NodeJS.Timer | null>(null);
  let timerHide = $state<NodeJS.Timer | null>(null);

  let mountedTooltip: ReturnType<typeof mountTooltip> | null = null;

  const id = Date.now();

  $effect(() => {
    if (value) {
      show();
    } else {
      if (mountedTooltip) {
        hide();
      }
    }
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

    realTarget?.addEventListener("mouseenter", show);
    realTarget?.addEventListener("mouseleave", hide);

    return () => {
      realTarget?.removeEventListener("mouseenter", show);
      realTarget?.removeEventListener("mouseleave", hide);

      tooltipEl?.removeEventListener("mouseenter", abortHide);
      tooltipEl?.removeEventListener("mouseleave", hide);

      window.removeEventListener("wheel", hide);

      if (tooltipHelperEl && realTarget) {
        document.body.removeChild(tooltipHelperEl);
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

    if (!delay) {
      mountedTooltip = mountTooltip();

      tooltipEl = (document.getElementById(`qtooltip-${id}`) as HTMLDivElement) || undefined;
      tooltipEl?.addEventListener("mouseenter", abortHide);
      tooltipEl?.addEventListener("mouseleave", hide);
      window?.addEventListener("wheel", hide);

      return;
    }

    if (timerShow) {
      clearTimeout(timerShow);
    }

    timerShow = setTimeout(() => {
      timerShow = null;
      mountedTooltip = mountTooltip();

      tooltipEl = (document.getElementById(`qtooltip-${id}`) as HTMLDivElement) || undefined;
      tooltipEl?.addEventListener("mouseenter", abortHide);
      tooltipEl?.addEventListener("mouseleave", hide);
      window?.addEventListener("wheel", hide);

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

    if (!hideDelay) {
      tooltipEl?.removeEventListener("mouseenter", abortHide);
      window?.removeEventListener("wheel", hide);
      unmount(mountedTooltip);
      mountedTooltip = null;

      return;
    }

    if (timerHide) {
      clearTimeout(timerHide);
      timerHide = null;
    }

    timerHide = setTimeout(() => {
      tooltipEl?.removeEventListener("mouseenter", abortHide);

      if (!mountedTooltip) {
        return;
      }

      unmount(mountedTooltip);
      window?.removeEventListener("wheel", hide);
      mountedTooltip = null;
      timerHide = null;
    }, hideDelay);
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
