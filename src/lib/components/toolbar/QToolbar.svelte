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
    "fill",
    inset && "q-toolbar--inset",
    userClasses,
  ]);

  $: style = createStyles({
    top: ctx !== undefined ? "0px" : undefined,
    left: ctx !== undefined ? "0px" : undefined,
    right: ctx !== undefined ? "0px" : undefined,
    transition: "all var(--speed3)",
    position: ctx !== undefined ? (ctx?.fixed === true ? "fixed" : "absolute") : undefined,
    width: "100%",
  });
</script>

<header class={classes} {style} role="toolbar" {...$$restProps}>
  <nav>
    <slot />
  </nav>
</header>

<style lang="scss">
  .q-toolbar--inset {
    padding-left: 58px;
  }

  .q-toolbar:has(~ div.q-drawer.left.active:not(.offset-top):not(.mini)) {
    left: 300px !important;
    width: calc(100% - 300px) !important;
  }

  .q-toolbar:has(~ div.q-drawer.right.active:not(.offset-top):not(.mini)) {
    right: 300px !important;
    width: calc(100% - 300px) !important;
  }

  .q-toolbar:has(~ div.q-drawer.left.active.mini:not(.offset-top)) {
    left: 57px !important;
    width: calc(100% - 57px) !important;
  }

  .q-toolbar:has(~ div.q-drawer.right.active.mini:not(.offset-top)) {
    right: 57px !important;
    width: calc(100% - 57px) !important;
  }
</style>
