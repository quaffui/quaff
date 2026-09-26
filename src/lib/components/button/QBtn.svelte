<!--
@component
Buttons help users take action, such as sending an email, sharing a document, or liking a comment.
-->

<script lang="ts">
  import { useColor, useSize } from "$composables";
  import { ripple } from "$helpers";
  import { buttonGroupCtx } from "$components/button-group/QBtnGroup.svelte";
  import { useQuaffConfig } from "$internal/quaffConfig.svelte";
  import { getRouterInfo, handleActivationKeydown, type QEvent } from "$utils";
  import QCircularProgress from "$components/progress/QCircularProgress.svelte";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import type { QBtnProps, QBtnVariantOptions } from "./props";

  type ButtonEvent<T extends Event> = QEvent<T, HTMLElement>;

  let {
    disabled = false,
    variant,
    color,
    filled = false,
    tonal = false,
    outlined = false,
    flat = false,
    expressive,
    icon,
    label,
    loading = false,
    noFocusRing = false,
    noRipple = false,
    rectangle = false,
    rippleColor,
    round = false,
    selected = $bindable(),
    shape,
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

  const group = buttonGroupCtx.get();
  const isDisabled = $derived(disabled || (group?.disabled ?? false));
  const resolvedShape = $derived(shape ?? group?.shape ?? "round");
  const isBaselineGroup = $derived(group !== undefined && !group.isExpressive);

  const routerInfo = $derived(getRouterInfo({ href, to, replace }));
  const computedTag = $derived(routerInfo.hasLink ? "a" : tag || "button");
  const quaffConfig = useQuaffConfig();
  const isExpressive = $derived(expressive ?? group?.isExpressive ?? quaffConfig.expressive);
  const resolvedSize = $derived(size ?? group?.size ?? (isExpressive ? "sm" : "md"));
  const qSize = $derived(useSize(resolvedSize, "q-btn"));
  const hasContent = $derived(label !== undefined || children !== undefined);

  const displayedIcon = $derived(isBaselineGroup && selected && hasContent ? "check" : icon);

  const finalVariant = $derived.by(resolveVariant);
  const isToggle = $derived(selected !== undefined && !(hasContent && finalVariant === "flat"));
  const fillIcon = $derived(isToggle ? selected === true : hasContent);

  function resolveVariant(): QBtnVariantOptions {
    if (variant) {
      return variant;
    }

    if (filled) {
      return "filled";
    }

    if (tonal) {
      return "tonal";
    }

    if (outlined) {
      return "outlined";
    }

    if (flat) {
      return "flat";
    }

    if (group) {
      return group.isExpressive ? "tonal" : "outlined";
    }

    if (unelevated || hasContent) {
      return "elevated";
    }

    return "flat";
  }

  const iconSize = $derived.by(() => {
    if (isBaselineGroup) {
      return "18px";
    }

    const standardSizes = {
      xs: "16px",
      sm: "20px",
      md: hasContent ? "20px" : "24px",
      lg: "28px",
      xl: "32px",
    } as const;
    const expressiveSizes = {
      ...standardSizes,
      xs: "20px",
      sm: hasContent ? "20px" : "24px",
      md: "24px",
      lg: "32px",
      xl: "40px",
    } as const;

    return (isExpressive ? expressiveSizes : standardSizes)[resolvedSize];
  });

  function handleClick(event: ButtonEvent<MouseEvent>) {
    if (isDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    onclick?.(event as Parameters<NonNullable<QBtnProps["onclick"]>>[0]);

    if (event.defaultPrevented) {
      return;
    }

    if (isToggle) {
      selected = !selected;
    }
  }

  function handleKeydown(event: ButtonEvent<KeyboardEvent>) {
    if (isDisabled) {
      return;
    }

    onkeydown?.(event as Parameters<NonNullable<QBtnProps["onkeydown"]>>[0]);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      event.currentTarget.blur();
    } else {
      handleActivationKeydown(event);
    }
  }

  Q.classes("q-btn", {
    bemClasses: {
      [finalVariant]: true,
      unelevated,
      expressive: isExpressive,
      selected: isToggle && selected,
      squared: isExpressive && resolvedShape === "squared",
      rectangle: !isExpressive && rectangle,
      round: !isExpressive && (round || !hasContent),
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
  href={isDisabled ? undefined : routerInfo.linkAttributes.href}
  data-sveltekit-replacestate={routerInfo.linkAttributes["data-sveltekit-replacestate"]}
  disabled={computedTag === "button" ? isDisabled : undefined}
  role={computedTag === "button" ? undefined : "button"}
  aria-disabled={isDisabled || undefined}
  aria-pressed={isToggle ? selected : undefined}
  tabindex={isDisabled ? -1 : tabindex}
  {target}
  onclick={handleClick}
  onkeydown={handleKeydown}
  {@attach ripple({ disabled: noRipple || isDisabled, color: rippleColor })}
  data-quaff
>
  {#if loading}
    <QCircularProgress
      expressive={isExpressive}
      indeterminate
      trackColor="transparent"
      color={color ?? "currentColor"}
      size={iconSize}
      class="q-btn__loader"
    />
  {:else if displayedIcon}
    {#if isBaselineGroup && selected && !hasContent}
      <QIconSnippet icon="check" size={iconSize} aria-hidden="true" class="q-btn__icon" />
    {/if}
    <QIconSnippet
      icon={displayedIcon}
      size={iconSize}
      filled={fillIcon}
      aria-hidden={hasContent || undefined}
      class="q-btn__icon"
    >
      {#snippet image(src)}
        <img {src} alt="" class="q-btn__img" />
      {/snippet}
    </QIconSnippet>
  {/if}

  {#if hasContent}
    <span class="q-btn__label">{label}{@render children?.()}</span>
  {/if}
</svelte:element>
