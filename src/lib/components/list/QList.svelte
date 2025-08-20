<script lang="ts" module>
  import { QContext } from "$lib/utils";
  import type { QListProps } from "./props";

  interface QListContext {
    readonly activeClass: string | undefined;
    readonly separatorOptions: QListProps["separatorOptions"];
  }

  export const listCtx = QContext<QListContext>("QList");
</script>

<script lang="ts">
  // #region:    --- Props
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
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let listEl: HTMLElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Context
  listCtx.set({
    activeClass,
    separatorOptions: separator ? separatorOptions : undefined,
  });
  // #endregion: --- Context

  // #region:    --- Effects
  $effect(() => {
    listEl.querySelector(".q-separator__wrapper:first-child")?.remove();
  });
  // #endregion: --- Effects

  Q.classes("q-list", {
    bemClasses: {
      bordered,
      dense,
      rounded: roundedBorders,
    },
    classes: [padding && "q-py-sm", "flex", "flex-center", props.class],
  });
</script>

<svelte:element this={tag} bind:this={listEl} {...props} class="q-list" data-quaff>
  {@render children?.()}
</svelte:element>
