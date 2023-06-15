<script lang="ts">
  import { setIndex } from "$lib/composables/use-index";
  import { createClasses } from "$lib/utils/props";
  import type { QListProps } from "./props";
  import { setContext } from "svelte";

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
  setIndex(startIndex);

  $: classes = createClasses([
    "q-list",
    bordered && "border",
    dense && "dense",
    padding && "q-py-sm",
    roundedBorders && "rounded-borders",
    userClasses,
  ]);
</script>

<svelte:element this={tag} class={classes} {...$$restProps}>
  <slot />
</svelte:element>

<style lang="scss">
  .q-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .rounded-borders {
    border-radius: 0.25rem;
  }
</style>
