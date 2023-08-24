<script lang="ts">
  import { useRouterLink, isRouteActive } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { Quaff } from "$lib/stores/Quaff";
  import { createClasses } from "$lib/utils";
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
    activeClass: QItemProps["activeClass"] = undefined,
    replace: QItemProps["replace"] = false,
    noRipple: QItemProps["noRipple"] = false,
    userClasses: QItemProps["userClasses"] = undefined;
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

  $: classes = createClasses(
    [
      $hasMultipleLines && "multiline",
      dense && "dense",
      (isActive || (hasLink && active)) && activeClass,
      (isActive || (hasLink && active)) && "active",
    ],
    {
      component: "q-item",
      quaffClasses: [linkClasses],
      userClasses,
    }
  );

  $: attributes = {
    class: classes,
    tabindex: isClickable == true ? Number(tabindex) || 0 : undefined,
    "aria-disabled": isActionable === true && disable === true ? true : undefined,
    ...$$restProps,
  };
</script>

{#if separatorOptions !== undefined}
  <QSeparator {...separatorOptions} />
{/if}
{#if linkAttributes.href !== undefined}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a use:ripple={{ disable: !isClickable || noRipple }} {...attributes} {...linkAttributes}>
    <slot />
  </a>
{:else}
  <svelte:element this={tag} {...attributes}>
    <slot />
  </svelte:element>
{/if}
