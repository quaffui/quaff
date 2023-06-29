<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QToolbarProps } from "./props";
  import type { AppbarContext } from "../layout/QLayout.svelte";
  import { isNumber } from "$lib/utils/types";

  export let inset: QToolbarProps["inset"] = false,
    height: QToolbarProps["height"] = "64px",
    userClasses: QToolbarProps["userClasses"] = undefined,
    userStyles: QToolbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: ctx = getContext<AppbarContext | undefined>("header");

  $: classes = createClasses([
    ctx && "q-header",
    "q-toolbar",
    "surface",
    ctx?.fixed && "fixed",
    inset && "q-toolbar--inset",
    userClasses,
  ]);

  $: heightStyle = ctx === undefined ? (isNumber(height) ? `${height}px` : height) : undefined;

  $: style = createStyles(
    {
      "--header-height": heightStyle,
    },
    userStyles
  );
</script>

<header class={classes} role="toolbar" {...$$restProps} {style}>
  <nav>
    <slot />
  </nav>
</header>
