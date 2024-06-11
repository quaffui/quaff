<script lang="ts">
  import { setContext } from "svelte";
  import type { QListProps } from "./props";

  let {
    bordered = false,
    roundedBorders = false,
    dense = false,
    separator = false,
    separatorOptions = {},
    padding = false,
    tag = "div",
    children,
    ...props
  }: QListProps = $props();

  let listEl: HTMLElement;

  $effect(() => {
    listEl.querySelector(".q-separator__wrapper:first-child")?.remove();
  });

  setContext("separator", separator ? separatorOptions : undefined);

  Q.classes("q-list", {
    bemClasses: {
      bordered,
      dense,
      rounded: roundedBorders,
    },
    classes: [padding && "q-py-sm", "flex", "flex-center", props.class],
  });
</script>

<svelte:element this={tag} bind:this={listEl} {...props} class="q-list" {...Q.classes}>
  {@render children?.()}
</svelte:element>
