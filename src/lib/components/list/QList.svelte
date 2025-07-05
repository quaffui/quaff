<script lang="ts">
  import { setContext } from "svelte";
  import { QListCtxName } from "$utils";
  import type { QListProps } from "./props";

  let {
    bordered = false,
    roundedBorders = false,
    dense = false,
    separator = false,
    separatorOptions = {},
    padding = false,
    tag = "div",
    activeClass,
    children,
    ...props
  }: QListProps = $props();

  setContext(QListCtxName.activeClass, () => activeClass);
  setContext(QListCtxName.separator, separator ? separatorOptions : undefined);

  let listEl: HTMLElement;

  $effect(() => {
    listEl.querySelector(".q-separator__wrapper:first-child")?.remove();
  });

  Q.classes("q-list", {
    bemClasses: {
      bordered,
      dense,
      rounded: roundedBorders,
    },
    classes: [padding && "q-py-sm", props.class],
  });
</script>

<svelte:element this={tag} bind:this={listEl} {...props} class="q-list" data-quaff>
  {@render children?.()}
</svelte:element>
