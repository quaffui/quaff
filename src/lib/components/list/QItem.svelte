<script lang="ts">
  import useRouterLink from "$lib/composables/use-router-link";
  import { stringifyClasses } from "$lib/utils/props";
  import { QItemProps } from "./props";

  export let tag: QItemProps["tag"] = "div",
    active: QItemProps["active"] = false,
    clickable: QItemProps["clickable"] = false,
    dense: QItemProps["dense"] = false,
    insetLevel: QItemProps["insetLevel"] = undefined,
    tabindex: QItemProps["tabindex"] = 0,
    focused: QItemProps["focused"] = false,
    manualFocus: QItemProps["manualFocus"] = false,
    href: QItemProps["href"] = undefined,
    to: QItemProps["to"] = undefined,
    disable: QItemProps["disable"] = false,
    activeClass: QItemProps["activeClass"] = undefined,
    replace: QItemProps["replace"] = false;

  let root = null,
    blurTarget = null;

  $: ({ hasLink, linkAttributes, linkClasses } = useRouterLink({
    href,
    to,
    disable,
    activeClass,
    replace,
  }));

  $: isActionable = clickable === true || hasLink === true || tag === "label";

  $: isClickable = disable !== true && isActionable === true;

  $: classes = stringifyClasses([
    "q-item row",
    linkClasses,
    hasLink && active && "q-item--active",
    hasLink && active && activeClass,
    isClickable && "wave",
  ]);

  $: style = "";
</script>
