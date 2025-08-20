<script lang="ts">
  import { QIcon } from "$lib";
  import { ripple } from "$helpers";
  import {
    getClosestFocusableBlock,
    getClosestFocusableSibling,
    getDirection,
    isActivationKey,
    isArrowKey,
    isRouteActive,
    isTabKey,
    type Direction,
    type QEvent,
  } from "$utils";
  import { tabsCtx } from "./QTabs.svelte";
  import type { QTabProps } from "./props";

  type QTabEl = HTMLAnchorElement | HTMLButtonElement;
  type QTabEvent<T> = QEvent<T, QTabEl>;

  // #region:    --- Props
  let { name, to, icon, children, ...props }: QTabProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let qTab: QTabEl;
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  const ctx = tabsCtx.assertGet("QTab should be use inside QTabs.");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const tag = $derived(to ? "a" : "button");

  const isActive = $derived(to ? isRouteActive(to) : name === ctx.value);
  // #endregion: --- Derived values

  // #region:    --- Functions
  function onclick(e: QTabEvent<MouseEvent>) {
    props.onclick?.(e);

    if (e.defaultPrevented || isActive) {
      return;
    }

    ctx.request = name;
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
  // #endregion: --- Functions

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

    {#if children}
      <span>{@render children?.()}</span>
    {/if}

    {#if ctx.variant === "primary"}
      <div class="q-tab__indicator"></div>
    {/if}
  </div>

  {#if ctx.variant !== "primary"}
    <div class="q-tab__indicator"></div>
  {/if}
</svelte:element>
