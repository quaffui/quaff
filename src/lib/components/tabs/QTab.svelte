<script lang="ts">
  import { QIcon } from "$lib";
  import { isRouteActive } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { Quaff } from "$lib/stores";
  import {
    createClasses,
    isActivationKey,
    isArrowKey,
    getDirection,
    getClosestFocusableSibling,
    isTabKey,
    getClosestFocusableBlock,
    movementDirection,
  } from "$lib/utils";
  import { hasContext, getContext } from "svelte";
  import type { Direction } from "$lib/utils";
  import { get } from "svelte/store";
  import type { Writable } from "svelte/store";
  import type { QTabProps, QTabsVariants } from "./props";
  import type { QTab, QTabStore } from "./QTabs.svelte";

  export let name: QTabProps["name"],
    to: QTabProps["to"] = undefined,
    icon: QTabProps["icon"] = undefined,
    userClasses: QTabProps["userClasses"] = undefined;
  export { userClasses as class };

  let index = 1;
  let qTab: QTab;

  const qTabStore = getContext<Writable<QTabStore>>("qTabStore");

  if (!hasContext("QTabCount")) {
    console.warn("QTab should be used inside QTabs");
  }

  let indexContext = getContext<{
    index: () => number;
  }>("QTabCount");

  $: if (indexContext) {
    index = indexContext.index();
  }

  const isInitallyActive =
    to !== undefined ? isRouteActive($Quaff.router, to) : name === $qTabStore.value;

  $: if (isInitallyActive && qTab) {
    setActive(qTab);
  }

  $: isActive = name === $qTabStore.value;

  let tag: "button" | "a";
  $: tag = to === undefined ? "button" : "a";

  $: classes = createClasses([isActive && "active"], {
    component: "q-tab",
    userClasses,
  });

  function setActive(el: QTab) {
    let store = get(qTabStore);
    const previousEl = store.activeEl;
    const variant = store.variant;

    let element;
    if (variant === "primary") {
      element = el.firstElementChild as QTab;
    } else {
      element = el;
    }

    const position = variant === "vertical" ? element.offsetTop : element.offsetLeft;
    const size = variant === "vertical" ? element.offsetHeight : element.offsetWidth;

    $qTabStore = {
      variant,
      value: name,
      previousEl,
      activeEl: el,
      utils: {
        size,
        position,
      },
    };
  }

  function onClick(e: MouseEvent) {
    if (!isActive) {
      setActive(e.target as QTab);
    }
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
