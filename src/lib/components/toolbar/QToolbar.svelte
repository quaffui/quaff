<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import { type QToolbarProps } from "./props";
  import { type AppbarContext } from "../layout/QLayout.svelte";

  export let inset: QToolbarProps["inset"] = false,
    userClasses: QToolbarProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses(["q-toolbar", "fill", inset && "q-toolbar--inset", userClasses]);

  $: ctx = getContext<AppbarContext | undefined>("header");

  $: style = createStyles({
    top: 0,
    left: ctx?.offset?.left === true ? "300px" : "0px",
    right: ctx?.offset?.right === true ? "300px" : "0px",
    position: ctx?.fixed === true ? "fixed" : "absolute",
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
</style>
