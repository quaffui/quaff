<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { type QListProps, QListDefaultProps } from "./props";
  import QSeparator from "../separator/QSeparator.svelte";
  import { QSeparatorDefaultProps } from "../separator/props";

  export let bordered: QListProps["bordered"] = false,
    roundedBorders: QListProps["roundedBorders"] = false,
    dense: QListProps["dense"] = false,
    separator: QListProps["separator"] = false,
    separatorOptions: QListProps["separatorOptions"] = {},
    padding: QListProps["padding"] = false,
    tag: QListProps["tag"] = "div";

  let listComponent: HTMLSpanElement | null = null;

  $: classes = stringifyClasses([
    "q-list",
    bordered && "border",
    dense && "???",
    padding && "q-py-sm",
  ]);

  $: style =
    roundedBorders === true
      ? stringifyStyles({
          borderRadius: "0.25rem",
        })
      : undefined;

  $: separator && listComponent && prepareChildren(listComponent);

  function prepareChildren(list: Element) {
    const children = Array.from(list.children);

    children.forEach((child, index) => {
      if (child.classList.contains("q-item") && index !== 0) {
        let separatorWrapper = document.createElement("div");
        separatorWrapper.classList.add("q-item--separator");

        new QSeparator({
          target: separatorWrapper,
          props: {
            ...QSeparatorDefaultProps,
            ...separatorOptions,
          },
        });

        child.parentNode?.insertBefore(separatorWrapper, child);
      }
    });
  }
</script>

<svelte:element this={tag} class={classes} bind:this={listComponent} {style}>
  <slot />
</svelte:element>
