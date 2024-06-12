<script lang="ts">
  import Icon from "../icon/Icon.svelte";
  import CircularProgress from "../progress/CircularProgress.svelte";
  import { useSize } from "$lib/composables/use-size";
  import { ripple } from "$lib/helpers/index";
  import { isActivationKey } from "$utils/events";
  import { extractImgSrc } from "$lib/utils/string";
  import type { BtnProps } from "./props";

  let {
    icon,
    label,
    disabled = false,
    loading = false,
    unelevated = false,
    outline = false,
    round = false,
    rectangle = false,
    noRipple = false,
    rippleColor,
    flat = false,
    to,
    size = "md",
    onclick,
    children,
    ...props
  }: BtnProps = $props();

  let kBtn: HTMLAnchorElement | HTMLButtonElement;

  const tag = $derived(to === undefined ? "button" : "a");
  const kSize = $derived(useSize(size, "q-btn"));

  const img = $derived(extractImgSrc(icon));

  function stopIfDisabled(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    onclick?.(e);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isActivationKey(e)) return;

    e.preventDefault();

    let click = new MouseEvent("click");
    stopIfDisabled(click);
  }

  Quaff.classes("q-btn", {
    bemClasses: {
      unelevated,
      rectangle,
      outline,
      flat,
      round: round || (!children && !label),
    },
    classes: [kSize.class, props.class],
  });
</script>

<svelte:element
  this={tag}
  bind:this={kBtn}
  use:ripple={{
    disabled: noRipple || disabled,
    color: rippleColor ? `var(--${rippleColor}, ${rippleColor})` : undefined,
  }}
  {...props}
  class="q-btn"
  {...Quaff.classes}
  style:--size={kSize.style}
  role={tag === "a" ? "button" : undefined}
  href={to}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  onkeydown={onKeyDown}
  onclick={stopIfDisabled}
>
  {#if icon && !loading}
    {#if img}
      <img src={img} alt="" class="q-btn__img q-btn__img--responsive" />
    {:else}
      <Icon name={icon} class="q-btn__icon" />
    {/if}
  {/if}

  {#if loading}
    <CircularProgress
      indeterminate
      trackColor="transparent"
      color={flat || outline ? "primary" : "on-primary"}
      size="2em"
      class="q-btn__loader"
    />
  {/if}

  {#if label}
    <span>{label}</span>
  {:else}
    {@render children?.()}
  {/if}
</svelte:element>

<style lang="scss">
  @import "./btn.scss";
</style>
