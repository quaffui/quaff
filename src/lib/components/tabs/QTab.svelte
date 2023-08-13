<script lang="ts">
  import { Quaff } from "$stores/Quaff";
  import { getContext, hasContext } from "svelte";
  import type { QTabProps, QTabsVariants } from "./props";
  import type { Writable } from "svelte/store";
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import { isRouteActive } from "$lib/composables/use-router-link";
  import type { Direction } from "$lib/utils/events";
  import { getDirection, isActivationKey, isArrowKey, isTabKey } from "$lib/utils/events";
  import { ripple } from "$lib/helpers/ripple";
  import { getClosestFocusableBlock, getClosestFocusableSibling } from "$lib/utils/dom";

  export let name: QTabProps["name"] = undefined,
    to: QTabProps["to"] = undefined,
    icon: QTabProps["icon"] = undefined,
    userClasses: QTabProps["userClasses"] = undefined;
  export { userClasses as class };

  let index = 1;
  type QTab = HTMLAnchorElement | HTMLButtonElement;
  let qTab: QTab;

  if (!hasContext("QTabCount")) {
    console.warn("QTab should be used inside QTabs");
  }

  const variant = getContext<QTabsVariants>("variant");

  let indexContext = getContext<{
    index: () => number;
  }>("QTabCount");

  $: if (indexContext) {
    index = indexContext.index();
  }

  let activeStore = getContext<
    Writable<{
      name?: string;
      index: number;
      size: number;
      position: string;
    }>
  >("activeTab");

  $: isActive = to !== undefined ? isRouteActive($Quaff.router, to) : name === $activeStore.name;

  $: if (isActive && qTab) {
    setActive(qTab);
  }

  let tag: "button" | "a";
  $: tag = to === undefined ? "button" : "a";

  $: classes = createClasses([isActive && "active"], {
    component: "q-tab",
    userClasses,
  });

  function setActive(el: HTMLElement) {
    let rect;
    if (variant === "primary") {
      rect = (el.firstElementChild as HTMLElement).getBoundingClientRect();
    } else {
      rect = el.getBoundingClientRect();
    }

    let indicatorWidth = variant === "vertical" ? rect.height : rect.width;
    let buttonWidth = el.offsetWidth;

    if (index !== $activeStore.index) {
      $activeStore = {
        name,
        index,
        position:
          variant === "vertical"
            ? `${el.offsetTop}px`
            : variant === "secondary"
            ? `${el.offsetLeft}px`
            : `calc(${el.offsetLeft}px + ${buttonWidth}px / 2)`,
        size: indicatorWidth,
      };
    }
  }

  function onClick(e: MouseEvent) {
    setActive(e.target as HTMLElement);
  }

  function onKeydown(e: KeyboardEvent) {
    if (isActivationKey(e)) {
      e.preventDefault();

      const click = new MouseEvent("click");
      qTab.dispatchEvent(click);
      return;
    }

    if (isArrowKey(e)) {
      e.preventDefault();
      const direction = getDirection(e);
      const targetTab = getClosestFocusableSibling(qTab, direction);

      if (targetTab === qTab) {
        return;
      }

      targetTab?.focus();
      return;
    }

    if (isTabKey(e)) {
      e.preventDefault();
      const direction: Direction = e.shiftKey ? "previous" : "next";

      const targetBlock = getClosestFocusableBlock(qTab, direction);

      targetBlock?.focus();
    }

    return;
  }
</script>

<svelte:element
  this={tag}
  use:ripple
  href={to}
  class={classes}
  role={tag === "a" ? "button" : undefined}
  aria-current={isActive || undefined}
  on:click
  on:click={onClick}
  on:keydown={onKeydown}
  {...$$restProps}
  bind:this={qTab}
>
  <div>
    {#if icon}
      <QIcon name={icon} class="q-tab__icon" />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}
    <slot />
  </div>
</svelte:element>
