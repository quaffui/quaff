<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { type QListProps, QListPropsDefaults } from "./props";
  import QSeparator from "../separator/QSeparator.svelte";
  import { QSeparatorPropsDefaults } from "../separator/props";

  export let bordered: QListProps["bordered"] = false,
    roundedBorders: QListProps["roundedBorders"] = false,
    dense: QListProps["dense"] = false,
    separator: QListProps["separator"] = false,
    separatorOptions: QListProps["separatorOptions"] = {},
    padding: QListProps["padding"] = false,
    tag: QListProps["tag"] = "div",
    userClasses: QListProps["userClasses"] = undefined,
    userStyles: QListProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  let listComponent: HTMLSpanElement | null = null;

  $: classes = stringifyClasses([
    "q-list",
    bordered && "border",
    dense && "???",
    padding && "q-py-sm",
    userClasses,
  ]);

  $: style = stringifyStyles(
    {
      borderRadius: roundedBorders === true ? "0.25rem" : undefined,
    },
    userStyles
  );

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
            ...QSeparatorPropsDefaults,
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
