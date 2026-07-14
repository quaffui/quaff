<script lang="ts">
  import { useColor, useSize } from "$composables";
  import { ripple } from "$helpers";
  import { quaffConfig } from "$internal/quaffConfig";
  import { extractImgSrc, getRouterInfo, isActivationKey, type QEvent } from "$utils";
  import QCircularProgress from "$components/progress/QCircularProgress.svelte";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import type { QBtnIcon, QBtnProps, QBtnVariantOptions } from "./props";

  type ButtonEvent<T extends Event> = QEvent<T, HTMLElement>;

  let {
    disabled = false,
    variant,
    color,
    filled = false,
    tonal = false,
    outlined = false,
    flat = false,
    expressive = false,
    icon,
    label,
    loading = false,
    noFocusRing = false,
    noRipple = false,
    rectangle = false,
    rippleColor,
    round = false,
    shape = "round",
    unelevated = false,
    size,
    href,
    to,
    replace = false,
    target,
    tag,
    tabindex,
    onclick,
    onkeydown,
    children,
    ...props
  }: QBtnProps = $props();

  const routerInfo = $derived(getRouterInfo({ href, to, replace }));
  const computedTag = $derived(routerInfo.hasLink ? "a" : tag || "button");
  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const resolvedSize = $derived(size ?? (isExpressive ? "sm" : "md"));
  const qSize = $derived(useSize(resolvedSize, "q-btn"));
  const src = $derived(typeof icon === "string" ? extractImgSrc(icon) : undefined);
  const hasLabel = $derived(label !== undefined || children !== undefined);

  const variants: Partial<Record<QBtnVariantOptions, boolean>> = $derived({
    filled,
    tonal,
    outlined,
    flat,
  });

  const boolVariant = $derived(
    (Object.keys(variants) as QBtnVariantOptions[]).find((key) => variants[key])
  );
  const finalVariant = $derived<QBtnVariantOptions>(variant || boolVariant || "elevated");

  const iconSize = $derived.by(() => {
    const standardSizes = {
      xs: "1rem",
      sm: "1.25rem",
      md: "1.5rem",
      lg: "1.75rem",
      xl: "2rem",
    } as const;
    const expressiveSizes = {
      ...standardSizes,
      xs: "1.25rem",
      lg: "2rem",
      xl: "2.5rem",
    } as const;

    return (isExpressive ? expressiveSizes : standardSizes)[resolvedSize];
  });

  const computedColor = $derived.by(() => {
    if (disabled) {
      return;
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

  function handleClick(event: ButtonEvent<MouseEvent>) {
    if (disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    onclick?.(event as Parameters<NonNullable<QBtnProps["onclick"]>>[0]);
  }

  function handleKeydown(event: ButtonEvent<KeyboardEvent>) {
    if (event.key === "Escape") {
      event.currentTarget.blur();
    }

    if (disabled) {
      return;
    }

    onkeydown?.(event as Parameters<NonNullable<QBtnProps["onkeydown"]>>[0]);

    if (isActivationKey(event)) {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  Q.classes("q-btn", {
    bemClasses: {
      [finalVariant]: true,
      unelevated,
      expressive: isExpressive,
      squared: isExpressive && shape === "squared",
      rectangle: !isExpressive && rectangle,
      round: !isExpressive && (round || !hasLabel),
    },
    classes: [qSize.class, routerInfo.linkClass, noFocusRing && "no-focus-ring", props.class],
  });
</script>

<svelte:element
  this={computedTag}
  {...props}
  class="q-btn"
  style:--q-btn-height={qSize.style}
  style:--q-btn-icon-size={iconSize}
  style:--ripple-color={color && useColor(color)}
  href={disabled ? undefined : routerInfo.linkAttributes.href}
  data-sveltekit-reload={routerInfo.linkAttributes["data-sveltekit-reload"]}
  disabled={computedTag === "button" ? disabled : undefined}
  role={computedTag === "button" ? undefined : "button"}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : tabindex}
  {target}
  onclick={handleClick}
  onkeydown={handleKeydown}
  {@attach ripple({ disabled: noRipple || disabled, color: rippleColor ?? computedColor })}
  data-quaff
>
  {#if loading}
    <QCircularProgress
      indeterminate
      trackColor="transparent"
      {color}
      size="1.5em"
      class="q-btn__loader"
    />
  {:else if src}
    <img {src} alt="" class="q-btn__img" />
  {:else if icon}
    <QIconSnippet
      icon={icon as Exclude<QBtnIcon, `img:${string}`>}
      size={iconSize}
      class="q-btn__icon"
    />
  {/if}

  {#if label !== undefined}
    <span class="q-btn__label">{label}</span>
  {:else if children}
    <span class="q-btn__label">{@render children()}</span>
  {/if}
</svelte:element>
