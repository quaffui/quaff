<script lang="ts">
  import { onMount } from "svelte";
  import { QIcon } from "$lib";
  import { ripple } from "$lib/helpers";
  import {
    isActivationKey,
    isArrowKey,
    getDirection,
    getClosestFocusableSibling,
    isTabKey,
    getClosestFocusableBlock,
  } from "$lib/utils";
  import type { Direction } from "$lib/utils";
  import { isRouteActive } from "$lib/utils/router";
  import QContext from "$lib/classes/QContext.svelte";
  import type { QTabProps } from "./props";
  import type { QTab, QTabStore } from "./QTabs.svelte";

  type QTabEvent<T> = T & {
    currentTarget: EventTarget & HTMLElement;
  };

  let { name, to, icon, iconSnippet, children, ...props }: QTabProps = $props();

  let qTab: QTab;

  const ctx = QContext.get<QTabStore>("q-tabs");

  const qTabStore = $derived(ctx?.value);

  const isActive = $derived(name === qTabStore?.value);

  $effect(() => {
    if (qTab && isActive && qTab !== qTabStore?.activeEl) {
      setActive(qTab);
    }
  });

  const tag: "button" | "a" = $derived(to === undefined ? "button" : "a");

  function setActive(el: QTab) {
    if (!qTabStore || !ctx) {
      return;
    }

    const previousEl = qTabStore.activeEl;
    const variant = qTabStore.variant;

    const child =
      variant === "primary" ? (el.firstElementChild as QTab) : { offsetLeft: 0, offsetWidth: 0 };

    const position = variant === "vertical" ? el.offsetTop : el.offsetLeft + child.offsetLeft;
    const size = variant === "vertical" ? el.offsetHeight : child.offsetWidth || el.offsetWidth;

    ctx.update({
      variant,
      value: name,
      previousEl,
      activeEl: el,
      utils: {
        size,
        position,
      },
    });
  }

  function onClick(e: QTabEvent<MouseEvent>) {
    if (!isActive) {
      setActive(e.target as QTab);
    }

    props.onclick?.(e);
  }

  function onKeydown(e: QTabEvent<KeyboardEvent>) {
    if (isActivationKey(e)) {
      e.preventDefault();

      const click = new MouseEvent("click");
      qTab.dispatchEvent(click);
      props.onkeydown?.(e);

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
      props.onkeydown?.(e);

      return;
    }

    if (isTabKey(e)) {
      e.preventDefault();
      const direction: Direction = e.shiftKey ? "previous" : "next";

      const targetBlock = getClosestFocusableBlock(qTab, direction);

      targetBlock?.focus();
      props.onkeydown?.(e);

      return;
    }

    props.onkeydown?.(e);

    return;
  }

  // eslint-disable-next-line svelte/valid-compile
  const isInitallyActive = to !== undefined ? $isRouteActive(to) : name === qTabStore?.value;

  onMount(() => {
    if (!qTabStore) {
      console.warn("QTab should be used inside QTabs");
    }

    if (isInitallyActive && qTab) {
      setActive(qTab);
    }
  });

  Q.classes("q-tab", {
    bemClasses: {
      active: isActive,
    },
    classes: [props.class],
  });
</script>

<svelte:element
  this={tag}
  {...props}
  use:ripple
  bind:this={qTab}
  href={to}
  role={tag === "a" ? "button" : undefined}
  aria-current={isActive || undefined}
  class="q-tab"
  onclick={onClick}
  onkeydown={onKeydown}
  {...Q.classes}
>
  <div>
    {#if icon}
      <QIcon name={icon} class="q-tab__icon" />
    {:else if iconSnippet}
      {@render iconSnippet()}
    {/if}
    {@render children?.()}
  </div>
</svelte:element>
