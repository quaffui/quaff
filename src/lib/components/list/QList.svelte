<script lang="ts">
  import { setIndex } from "$lib/composables/use-index";
  import { createClasses } from "$lib/utils/props";
  import type { QListProps } from "./props";
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

  let listElement: HTMLElement;

  onMount(() => listElement.querySelector(".q-separator__wrapper:first-child")?.remove());

  $: setContext("separator", separator === true ? separatorOptions : undefined);

  $: classes = createClasses([
    "q-list",
    bordered && "border",
    dense && "dense",
    padding && "q-py-sm",
    roundedBorders && "rounded-borders",
    userClasses,
  ]);
</script>

<svelte:element this={tag} class={classes} {...$$restProps} bind:this={listElement} on:scroll>
  <slot />
</svelte:element>
