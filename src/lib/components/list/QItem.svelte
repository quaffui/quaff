<script lang="ts">
  import { useRouterLink, isRouteActive } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { Quaff } from "$lib/stores/Quaff";
  import { setContext, getContext } from "svelte";
  import { writable } from "svelte/store";
  import { QSeparator } from "$lib";
  import type { QItemProps, QListProps } from "./props";

  export let tag: QItemProps["tag"] = "div",
    active: QItemProps["active"] = false,
    clickable: QItemProps["clickable"] = false,
    dense: QItemProps["dense"] = false,
    tabindex: QItemProps["tabindex"] = 0,
    href: QItemProps["href"] = undefined,
    to: QItemProps["to"] = undefined,
    disable: QItemProps["disable"] = false,
    activeClass: QItemProps["activeClass"] = "",
    replace: QItemProps["replace"] = false,
    noRipple: QItemProps["noRipple"] = false,
    userClasses: QItemProps["userClasses"] = "";
  export { userClasses as class };

  let hasMultipleLines = writable(false);
  setContext("hasMultipleLines", hasMultipleLines);

  $: ({ hasLink, linkAttributes, linkClasses } = useRouterLink({
    href,
    to,
    disable,
    activeClass,
    replace,
  }));

  $: separatorOptions = getContext<QListProps["separatorOptions"] | undefined>("separator");

  $: isActionable = clickable || hasLink || tag === "label";
  $: isClickable = isActionable && !disable;
  $: isActive = isRouteActive($Quaff.router, to);
</script>

{#if separatorOptions !== undefined}
  <QSeparator {...separatorOptions} />
{/if}
{#if linkAttributes.href !== undefined}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <a
    use:ripple={{ disable: !isClickable || noRipple }}
    class="q-item {linkClasses} {isActive || (hasLink && active) ? activeClass : ''} {userClasses}"
    class:q-item--active={isActive || (hasLink && active)}
    class:q-item--multiline={$hasMultipleLines}
    class:q-item--dense={dense}
    tabindex={isClickable ? Number(tabindex) || 0 : -1}
    aria-disabled={(isActionable && disable) || undefined}
    {...linkAttributes}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <svelte:element
    this={tag}
    class="q-item {isActive || (hasLink && active) ? activeClass : ''} {userClasses}"
    class:q-item--active={isActive || (hasLink && active)}
    class:q-item--multiline={$hasMultipleLines}
    class:q-item--dense={dense}
    tabindex={isClickable ? Number(tabindex) || 0 : -1}
    aria-disabled={(isActionable && disable) || undefined}
    {...$$restProps}
  >
    <slot />
  </svelte:element>
{/if}
