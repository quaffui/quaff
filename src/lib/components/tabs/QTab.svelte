<script lang="ts">
  import { Quaff } from "$stores/Quaff";
  import { getContext, hasContext } from "svelte";
  import type { QTabProps, QTabsVariants } from "./props";
  import type { Writable } from "svelte/store";
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import { isRouteActive } from "$lib/composables/use-router-link";

  export let name: QTabProps["name"] = undefined,
    to: QTabProps["to"] = undefined,
    icon: QTabProps["icon"] = undefined,
    userClasses: QTabProps["userClasses"] = undefined;
  export { userClasses as class };

  let index = 1;
  let tabEl: HTMLElement | null = null;

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

  $: if (isActive && tabEl) {
    setActive(tabEl);
  }

  let tag: "button" | "a";
  $: tag = to === undefined ? "button" : "a";

  $: classes = createClasses([
    "q-tab",
    isActive ? "active primary-text on-surface-text" : "surface on-surface-variant-text",
    tag === "a" && "button",
    userClasses,
  ]);

  function setActive(el: HTMLElement) {
    let rect;
    if (variant === "primary") {
      rect = (el.firstChild as HTMLElement).getBoundingClientRect();
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

  function handleClick(e: MouseEvent) {
    setActive(e.target as HTMLElement);
  }
</script>

<svelte:element
  this={tag}
  href={to}
  class={classes}
  on:click={handleClick}
  on:keyup
  on:keydown
  on:keypress
  {...$$restProps}
  bind:this={tabEl}
>
  <div>
    {#if icon}
      <QIcon name={icon} />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}
    <slot />
  </div>
</svelte:element>
