<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import { type QToolbarProps } from "./props";
  import { type AppbarContext } from "../layout/QLayout.svelte";

  export let inset: QToolbarProps["inset"] = false,
    userClasses: QToolbarProps["userClasses"] = undefined;
  export { userClasses as class };

  $: ctx = getContext<AppbarContext | undefined>("header");

  $: classes = createClasses([
    ctx && "q-header",
    "q-toolbar",
    ctx?.fixed && "fixed",
    inset && "q-toolbar--inset",
    userClasses,
  ]);
</script>

<header class={classes} role="toolbar" {...$$restProps}>
  <nav>
    <slot />
  </nav>
</header>

<style lang="scss">
  .q-toolbar {
    width: 100%;
    height: 64px;
    transition: all var(--speed3);
    &--inset {
      padding-left: 58px;
    }
  }
</style>
