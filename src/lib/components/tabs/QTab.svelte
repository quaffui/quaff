<script lang="ts">
  import { getContext, hasContext } from "svelte";
  import { QIcon } from "$lib";
  import QContext from "$lib/classes/QContext.svelte";
  import { ripple } from "$lib/helpers";
  import { getClosestFocusableBlock, getClosestFocusableSibling } from "$lib/utils/dom";
  import type { Direction } from "$lib/utils/events";
  import { getDirection, isActivationKey, isArrowKey, isTabKey } from "$lib/utils/events";
  import { isRouteActive } from "$lib/utils/router";
  import type { QEvent } from "$utils/types";
  import type { QTabEl } from "./QTabs.svelte";
  import type { QTabProps, QTabsVariants } from "./props";

  type QTabEvent<T> = QEvent<T, QTabEl>;

  let { name, to, icon, children, ...props }: QTabProps = $props();

  let qTab: QTabEl;

  const tag = $derived(to ? "a" : "button");

  if (!hasContext("QTabsValue")) {
    console.warn("QTab should be use inside QTabs.");
  }

  const qTabsRequestCtx = QContext.get<string | null>("QTabsRequest")!;

  const qTabsValueCtx = QContext.get<string | undefined | null>("QTabsValue")!;
  const variant = getContext<QTabsVariants>("QTabsVariant");
  const isActive = $derived(to ? isRouteActive(to) : name === qTabsValueCtx.value);

  function onclick(e: QTabEvent<MouseEvent>) {
    props.onclick?.(e);

    if (e.defaultPrevented || isActive) {
      return;
    }

    qTabsRequestCtx.update(name);
  }

  function onkeydown(e: QTabEvent<KeyboardEvent>) {
    props.onkeydown?.(e);

    if (isActivationKey(e)) {
      e.preventDefault();

      const click = new MouseEvent("click") as QTabEvent<MouseEvent>;
      return onclick(click);
    }

    if (isArrowKey(e)) {
      e.preventDefault();
      const direction = getDirection(e);
      const targetTab = getClosestFocusableSibling(qTab, direction);

      if (targetTab === qTab) {
        return;
      }

      return targetTab?.focus();
    }

    if (isTabKey(e)) {
      e.preventDefault();
      const direction: Direction = e.shiftKey ? "previous" : "next";
      const targetBlock = getClosestFocusableBlock(qTab, direction);

      targetBlock?.focus();
    }
  }

  Q.classes("q-tab", {
    bemClasses: {
      active: isActive,
    },
    classes: [props.class],
  });
</script>

<svelte:element
  this={tag}
  bind:this={qTab}
  use:ripple
  {...props}
  class="q-tab"
  href={to}
  role={tag === "a" ? "button" : undefined}
  aria-current={isActive || undefined}
  aria-label={name}
  {onclick}
  {onkeydown}
  data-quaff
>
  <div class="q-tab__content">
    {#if typeof icon === "string"}
      <QIcon name={icon} class="q-tab__icon" />
    {:else}
      {@render icon?.()}
    {/if}

    {@render children?.()}

    {#if variant === "primary"}
      <div class="q-tab__indicator"></div>
    {/if}
  </div>

  {#if variant !== "primary"}
    <div class="q-tab__indicator"></div>
  {/if}
</svelte:element>
