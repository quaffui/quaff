<script lang="ts">
  import { Context } from "$lib/stores/ref.svelte";
  import type { ListProps } from "./props";

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
  }: ListProps = $props();

  let listEl: HTMLElement;

  $effect(() => {
    listEl.querySelector(".q-separator__wrapper:first-child")?.remove();
  });

  new Context(separator ? separatorOptions : undefined).set("separator");

  Quaff.classes("q-list", {
    bemClasses: {
      bordered,
      dense,
      rounded: roundedBorders,
    },
    classes: [padding && "q-py-sm", "flex", "flex-center", props.class],
  });
</script>

<svelte:element this={tag} bind:this={listEl} {...props} class="q-list" {...Quaff.classes}>
  {@render children?.()}
</svelte:element>

<style lang="scss">
  @import "./list.scss";
</style>
