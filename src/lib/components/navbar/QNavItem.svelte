<script lang="ts">
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import { ripple } from "$helpers";
  import { getRouterInfo, isActivationKey, type QEvent } from "$utils";
  import type { QNavItemProps } from "./props";

  type QNavItemElement = HTMLAnchorElement | HTMLButtonElement;
  type QNavItemEvent<T extends Event> = QEvent<T, QNavItemElement>;

  // #region:    --- Props
  let {
    active,
    activeClass,
    activeStyle,
    icon,
    label,
    badge,
    badgeAriaLabel,
    disabled = false,
    noRipple = false,
    rippleColor,
    href,
    to,
    replace = false,
    target,
    tabindex,
    style,
    onclick,
    onkeydown,
    children,
    ...props
  }: QNavItemProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const uid = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const routerInfo = $derived(getRouterInfo({ href, to, replace }));
  const tag = $derived(routerInfo.hasLink ? "a" : "button");
  const isActive = $derived(active ?? !!routerInfo.isActive);
  const itemStyle = $derived(
    [isActive && activeStyle, style].filter(Boolean).join("; ") || undefined
  );
  const visualBadgeId = `${uid}-badge`;
  const badgeLabelId = `${uid}-badge-label`;
  const ariaDescribedby = $derived(
    [props["aria-describedby"], badge && (badgeAriaLabel ? badgeLabelId : visualBadgeId)]
      .filter(Boolean)
      .join(" ") || undefined
  );
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    if (label === undefined && !children) {
      console.warn("QNavItem should have a visible label supplied by `label` or `children`.");
    }
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  function handleClick(event: QNavItemEvent<MouseEvent>) {
    if (disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    onclick?.(event);
  }

  function handleKeydown(event: QNavItemEvent<KeyboardEvent>) {
    if (disabled) {
      return;
    }

    onkeydown?.(event);

    if (event.defaultPrevented || tag !== "a" || !isActivationKey(event)) {
      return;
    }

    if (event.code !== "Enter") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }
  // #endregion: --- Functions

  Q.classes("q-nav-item", {
    bemClasses: {
      active: isActive,
      "no-ripple": noRipple,
    },
    classes: [routerInfo.linkClass, isActive && activeClass, props.class],
  });
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- Link attributes are normalized by getRouterInfo. -->
<svelte:element
  this={tag}
  {...props}
  class="q-nav-item"
  style={itemStyle}
  type={tag === "button" ? "button" : undefined}
  href={disabled ? undefined : routerInfo.linkAttributes.href}
  data-sveltekit-replacestate={routerInfo.linkAttributes["data-sveltekit-replacestate"]}
  disabled={tag === "button" ? disabled : undefined}
  aria-disabled={disabled || undefined}
  aria-current={isActive ? (props["aria-current"] ?? "page") : props["aria-current"]}
  aria-describedby={ariaDescribedby}
  tabindex={disabled ? -1 : tabindex}
  {target}
  onclick={handleClick}
  onkeydown={handleKeydown}
  {@attach ripple({
    center: true,
    disabled: noRipple || disabled,
    color: rippleColor,
    effectTarget: ".q-nav-item__target",
  })}
  data-quaff
>
  <span class="q-nav-item__target">
    <span class="q-nav-item__indicator" aria-hidden="true"></span>

    <span class="q-nav-item__icon" aria-hidden="true">
      <QIconSnippet {icon} size={24} filled={isActive} />

      {#if badge}
        <span id={visualBadgeId} class="q-nav-item__badge" aria-hidden="true">
          {@render badge()}
        </span>
      {/if}
    </span>

    <span class="q-nav-item__label">
      {#if label !== undefined}
        {label}
      {:else}
        {@render children?.()}
      {/if}
    </span>
  </span>

  {#if badge && badgeAriaLabel}
    <span id={badgeLabelId} hidden>{badgeAriaLabel}</span>
  {/if}
</svelte:element>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
