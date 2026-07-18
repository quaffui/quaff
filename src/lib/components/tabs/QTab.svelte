<script lang="ts">
  import { ripple } from "$helpers";
  import { getRouterInfo, isActivationKey, type QEvent } from "$utils";
  import QIcon from "$components/icon/QIcon.svelte";
  import { tabsCtx } from "./QTabs.svelte";
  import type { QTabProps } from "./props";

  type QTabEl = HTMLAnchorElement | HTMLButtonElement;
  type QTabEvent<T extends Event> = QEvent<T, QTabEl>;

  // #region:    --- Props
  let {
    name,
    icon,
    activeClass: activeClassProp,
    activeStyle,
    children,
    style,
    ...props
  }: QTabProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let qTab: QTabEl;
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  const ctx = tabsCtx.assertGet("QTab should be use inside QTabs.");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const routerInfo = $derived(getRouterInfo(props));
  const tag = $derived(routerInfo.hasLink ? "a" : "button");

  const isActive = $derived(routerInfo.isActive ?? name === ctx.value);

  const activeClass = $derived(isActive && (activeClassProp ?? ctx.activeClass));
  const tabStyle = $derived(
    [isActive && (activeStyle ?? ctx.activeStyle), style].filter(Boolean).join("; ") || undefined
  );
  const stacked = $derived(ctx.variant === "primary" && !ctx.inlineLabel && !!icon && !!children);
  const tabindex = $derived(
    ctx.focused === name || (ctx.focused === null && (isActive || ctx.value === undefined)) ? 0 : -1
  );
  // #endregion: --- Derived values

  // #region:    --- Functions
  function onclick(e: QTabEvent<MouseEvent>) {
    props.onclick?.(e);

    if (e.defaultPrevented || isActive) {
      return;
    }

    ctx.request(name);
  }

  function onkeydown(e: QTabEvent<KeyboardEvent>) {
    props.onkeydown?.(e);

    if (isActivationKey(e)) {
      e.preventDefault();
      return qTab.click();
    }

    const vertical = ctx.variant === "vertical";
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    if (![previous, next, "Home", "End"].includes(e.code)) {
      return;
    }

    e.preventDefault();
    const tabs = Array.from(
      qTab.parentElement?.querySelectorAll<QTabEl>(
        ':scope > .q-tab:not([disabled], [aria-disabled="true"])'
      ) ?? []
    );
    const current = tabs.indexOf(qTab);
    const rtl = !vertical && getComputedStyle(qTab).direction === "rtl";
    const offset = (e.code === previous ? -1 : 1) * (rtl ? -1 : 1);
    const index = e.code === "Home" ? 0 : e.code === "End" ? tabs.length - 1 : current + offset;

    tabs.at(index % tabs.length)?.focus();
  }

  function onfocus(e: QTabEvent<FocusEvent>) {
    props.onfocus?.(e);
    ctx.focused = name;
  }
  // #endregion: --- Functions

  Q.classes("q-tab", {
    bemClasses: {
      active: isActive,
      stacked,
    },
    classes: [routerInfo.linkClass, activeClass, props.class],
  });
</script>

<svelte:element
  this={tag}
  bind:this={qTab}
  {@attach ripple()}
  {...props}
  {...routerInfo.linkAttributes}
  class="q-tab"
  style={tabStyle}
  role="tab"
  type={tag === "button" ? "button" : undefined}
  aria-selected={isActive}
  aria-label={props["aria-label"] ?? (children ? undefined : name)}
  {tabindex}
  data-q-tab-name={name}
  {onclick}
  {onkeydown}
  {onfocus}
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
