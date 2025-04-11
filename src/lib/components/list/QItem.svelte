<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { getRouterInfo, isRouteActive } from "$lib/utils/router";
  import { ripple } from "$lib/helpers/ripple";
  import { QContext } from "$lib/classes/QContext.svelte";
  import QSeparator from "../separator/QSeparator.svelte";
  import type { QItemProps, QListProps } from "./props";

  let {
    tag = "div",
    active = false,
    clickable = false,
    dense = false,
    tabindex = 0,
    href,
    to,
    disabled = false,
    activeClass = "active",
    replace = false,
    noRipple = false,
    children,
    ...props
  }: QItemProps = $props();

  const routerInfo = $derived(
    getRouterInfo({
      href,
      to,
      disabled,
      activeClass,
      replace,
    })
  );

  const listActiveClass = getContext<() => string>("listItemsActiveClass");

  const activeClassToUse = $derived(
    activeClass === "active" ? listActiveClass() || activeClass : activeClass
  );

  setContext("itemActiveClass", () => active && activeClassToUse);

  const multiline = new QContext("multiline", false);

  const separatorOptions = getContext<QListProps["separatorOptions"] | undefined>("separator");

  const isActionable = $derived(clickable || routerInfo.hasLink || tag === "label");
  const isClickable = $derived(isActionable && !disabled);

  const isActive = $derived(isRouteActive(to || href) || active);

  Q.classes("q-item", {
    bemClasses: {
      multiline: multiline.value,
      dense,
      active: isActive,
      clickable,
    },
    classes: [routerInfo.linkClasses, isActive && activeClassToUse, props.class],
  });
</script>

{#if separatorOptions}
  <QSeparator {...separatorOptions} />
{/if}

{#if routerInfo.linkAttributes.href}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <a
    use:ripple={{ disabled: !isClickable || noRipple }}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    {...routerInfo.linkAttributes}
    data-quaff
  >
    {@render children?.()}
  </a>
{:else}
  <svelte:element
    this={tag}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    data-quaff
  >
    {@render children?.()}
  </svelte:element>
{/if}
