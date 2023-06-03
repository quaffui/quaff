<script lang="ts">
  import QSeparator from "$lib/components/separator/QSeparator.svelte";
  import useRouterLink from "$lib/composables/use-router-link";
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import { type QListProps, type QItemProps } from "./props";

  export let tag: QItemProps["tag"] = "div",
    active: QItemProps["active"] = false,
    clickable: QItemProps["clickable"] = false,
    dense: QItemProps["dense"] = false,
    tabindex: QItemProps["tabindex"] = 0,
    href: QItemProps["href"] = undefined,
    to: QItemProps["to"] = undefined,
    disable: QItemProps["disable"] = false,
    activeClass: QItemProps["activeClass"] = undefined,
    replace: QItemProps["replace"] = false;

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

  $: classes = stringifyClasses([
    "q-item row q-pl-sm",
    hasLink && active && "q-item--active",
    hasLink && active && activeClass,
    isClickable && "wave",
    linkClasses,
  ]);

  $: style = stringifyStyles({
    minHeight: dense ? "32px" : undefined,
    margin: "0",
    padding: "0.75rem",
  });

  $: attributes = {
    class: classes,
    style,
    tabindex: isClickable == true ? Number(tabindex) || 0 : undefined,
    "aria-disabled": isActionable === true ? true : undefined,
  };

  const { index } = getContext<{ index: () => number }>("setIndex");
</script>

{#if separatorOptions !== undefined && index() !== 0}
  <QSeparator {...separatorOptions} />
{/if}
{#if linkAttributes.href !== undefined}
  <a {...attributes} {...linkAttributes}>
    <slot />
  </a>
{:else}
  <div {...attributes}>
    <slot />
  </div>
{/if}
