<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { type QListProps, QListPropsDefaults } from "./props";
  import QSeparator from "../separator/QSeparator.svelte";
  import { QSeparatorPropsDefaults } from "../separator/props";
  import { onMount, setContext } from "svelte";

  export let bordered: QListProps["bordered"] = false,
    roundedBorders: QListProps["roundedBorders"] = false,
    dense: QListProps["dense"] = false,
    separator: QListProps["separator"] = false,
    separatorOptions: QListProps["separatorOptions"] = {},
    padding: QListProps["padding"] = false,
    tag: QListProps["tag"] = "div",
    userClasses: QListProps["userClasses"] = undefined;
  export { userClasses as class };

  $: setContext("separator", separator === true ? separatorOptions : undefined);
  let startIndex = -1;
  setContext("setIndex", {
    index: () => {
      startIndex += 1;
      return startIndex;
    },
  });

  $: classes = createClasses([
    "q-list",
    bordered && "border",
    dense && "???",
    padding && "q-py-sm",
    roundedBorders && "rounded-borders",
    userClasses,
  ]);
</script>

<svelte:element this={tag} class={classes} {...$$restProps}>
  <slot />
</svelte:element>

<style lang="scss">
  .rounded-borders {
    border-radius: 0.25rem;
  }
</style>
