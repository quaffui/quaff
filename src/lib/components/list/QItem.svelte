<script lang="ts">
  import QSeparator from "$lib/components/separator/QSeparator.svelte";
  import useRouterLink, { isRouteActive } from "$lib/composables/use-router-link";
  import { createClasses } from "$lib/utils/props";
  import { getContext, setContext } from "svelte";
  import type { QListProps, QItemProps } from "./props";
  import { Quaff } from "$lib/stores/Quaff";
  import { writable } from "svelte/store";

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
    userClasses: QItemProps["userClasses"] = undefined;
  export { userClasses as class };

  let hasMultiplLines = writable(false);
  setContext("hasMultipleLines", hasMultiplLines);

  $: ({ hasLink, linkAttributes, linkClasses } = useRouterLink({
    href,
    to,
    disable,
    activeClass,
    replace,
  }));

  $: separatorOptions = getContext<QListProps["separatorOptions"] | undefined>("separator");

  $: isActionable = clickable === true || hasLink === true || tag === "label";

  $: isClickable = disable !== true && isActionable === true;

  $: isActive = isRouteActive($Quaff.router, to);

  $: classes = createClasses([
    "q-item flex middle-align",
    $hasMultiplLines && "multiline",
    dense && "dense",
    hasLink && active && "q-item--active",
    hasLink && active && activeClass,
    isActive && "active",
    isClickable && "wave",
    linkClasses,
    userClasses,
  ]);

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
  <a {...attributes} {...linkAttributes} {...$$restProps} on:mouseenter on:mouseleave on:click>
    <slot />
  </a>
{:else}
  <div {...attributes} {...$$restProps} on:mouseenter on:mouseleave on:click>
    <slot />
  </div>
{/if}
