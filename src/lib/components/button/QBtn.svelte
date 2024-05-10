<svelte:options runes={true} />

<script lang="ts">
  import QCircularProgress from "$lib/components/progress/QCircularProgress.svelte";
  import { useSize } from "$lib/composables/useSize";
  import { ripple } from "$lib/helpers";
  import { isActivationKey } from "$lib/utils";
  import { extractImgSrc } from "$lib/utils/string";
  import QIcon from "../icon/QIcon.svelte";
  import type { QBtnProps } from "./props";

  let {
    disabled = false,
    design = "elevated",
    icon,
    label,
    loading = false,
    rectangle = false,
    noRipple = false,
    rippleColor,
    round = false,
    to,
    unelevated = false,
    size = "md",
    target,
    onclick,
    children,
    ...props
  }: QBtnProps = $props();

  let qBtn: HTMLButtonElement | HTMLAnchorElement;

  const tag = $derived(to ? "a" : "button");
  const qSize = $derived(useSize(size, "q-btn"));

  const src = $derived(extractImgSrc(icon));

  const color = $derived(
    `var(--${design === "filled" ? "on-primary" : design === "tonal" ? "on-secondary-container" : "primary"})`
  );

  const rippleColorVar = $derived(rippleColor ? `var(--${rippleColor}, ${rippleColor})` : color);

  type QBtnMouseEvent = MouseEvent & {
    currentTarget: EventTarget & (HTMLButtonElement | HTMLAnchorElement);
  };

  function stopIfDisabled(e: QBtnMouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    onclick?.(e);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      qBtn?.blur();
      return;
    }

    if (!isActivationKey(e)) return;

    e.preventDefault();

    const click = new MouseEvent("click", { relatedTarget: qBtn }) as QBtnMouseEvent;
    stopIfDisabled(click);
  }

  __Quaff__.classes("q-btn", {
    bemClasses: {
      [design]: true,
      unelevated,
      rectangle,
      round: round || (!children && !label),
    },
    classes: [qSize.class, props.class],
  });
</script>

<svelte:element
  this={tag}
  bind:this={qBtn}
  use:ripple={{
    disabled: noRipple || disabled,
    color: rippleColorVar,
  }}
  {...props}
  class="q-btn"
  {...__Quaff__.classes}
  style:--q-btn-size={qSize.style}
  style:--ripple-color={color}
  role={tag === "a" ? "button" : undefined}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  {onkeydown}
  onclick={stopIfDisabled}
>
  {#if icon && !loading}
    {#if src}
      <img {src} alt="q-btn leading icon" class="q-btn__img q-btn__img--responsive" />
    {:else}
      <QIcon name={icon} {color} class="q-btn__icon" />
    {/if}
  {/if}

  {#if loading}
    <QCircularProgress
      indeterminate
      trackColor="transparent"
      {color}
      size="1.5em"
      class="q-btn__loader"
    />
  {/if}

  <span class="q-btn__label">
    {#if label}
      {label}
    {:else}
      {@render children?.()}
    {/if}
  </span>
</svelte:element>

<style lang="scss">
  @import "./QBtn.scss";
</style>
