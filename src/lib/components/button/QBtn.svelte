<script lang="ts">
  import { onMount } from "svelte";
  import { QCircularProgress, QIcon } from "$lib";
  import { useSize } from "$composables";
  import { ripple } from "$helpers";
  import { isActivationKey, extractImgSrc, type QEvent } from "$utils";
  import type { MaterialSymbol } from "material-symbols";
  import type { QBtnProps, QBtnVariantOptions } from "./props";

  type QBtnMouseEvent = QEvent<MouseEvent, typeof qBtn>;

  // #region:    --- Props
  let {
    disabled = false,
    variant,
    color,
    filled = false,
    tonal = false,
    outlined = false,
    flat = false,
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
    tag,
    onclick,
    children,
    ...props
  }: QBtnProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let qBtn: HTMLElement;
  let qBtnLabel: HTMLSpanElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const computedTag = $derived(to ? "a" : tag || "button");
  const qSize = $derived(useSize(size, "q-btn"));

  const src = $derived(extractImgSrc(icon));

  const variants: Partial<Record<QBtnVariantOptions, boolean>> = {
    filled,
    tonal,
    outlined,
    flat,
  };

  const boolVariant = $derived(
    (Object.keys(variants) as QBtnVariantOptions[]).find((key) => variants[key])
  );

  const finalVariant = $derived<QBtnVariantOptions>(variant || boolVariant || "elevated");

  const computedColor = $derived.by(() => {
    if (disabled) {
      return undefined;
    }

    if (color) {
      return color;
    }

    if (finalVariant === "filled") {
      return "on-primary";
    }

    if (finalVariant === "tonal") {
      return "on-secondary-container";
    }

    return "primary";
  });

  const colorVar = $derived(computedColor && `var(--${computedColor})`);

  const rippleColorVar = $derived(rippleColor ? `var(--${rippleColor}, ${rippleColor})` : colorVar);
  // #endregion: --- Derived values

  // #region:    --- Lifecycle
  onMount(() => {
    const { width, height } = qBtnLabel.getBoundingClientRect();

    // This is required for buttons with no label and with a tooltip to be round
    if (width === 0 && height === 0) {
      qBtn.classList.add("q-btn--round");
    }
  });
  // #endregion: --- Lifecycle

  // #region:    --- Functions
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

    if (!isActivationKey(e)) {
      return;
    }

    e.preventDefault();

    const click = new MouseEvent("click", { relatedTarget: qBtn }) as QBtnMouseEvent;
    stopIfDisabled(click);
  }
  // #endregion: --- Functions

  Q.classes("q-btn", {
    bemClasses: {
      [finalVariant]: true,
      unelevated,
      rectangle,
      round: round || (!children && !label),
    },
    classes: [qSize.class, props.class],
  });
</script>

<svelte:element
  this={computedTag}
  bind:this={qBtn}
  use:ripple={{
    disabled: noRipple || disabled,
    color: rippleColorVar,
  }}
  {...props}
  class="q-btn"
  style:--q-btn-size={qSize.style}
  style:--ripple-color={colorVar}
  {target}
  href={to}
  role={computedTag === "a" ? "button" : undefined}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : props.tabindex || 0}
  {onkeydown}
  onclick={stopIfDisabled}
  data-quaff
>
  {#if icon && !loading}
    {#if src}
      <img {src} alt="q-btn leading icon" class="q-btn__img q-btn__img--responsive" />
    {:else}
      <QIcon name={icon as MaterialSymbol} {color} class="q-btn__icon" {size} />
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

  <span bind:this={qBtnLabel} class="q-btn__label">
    {#if label}
      {label}
    {/if}

    {@render children?.()}
  </span>
</svelte:element>
