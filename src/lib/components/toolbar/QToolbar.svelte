<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QToolbarProps } from "./props";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import { isNumber } from "$lib/utils/types";

  export let inset: QToolbarProps["inset"] = false,
    height: QToolbarProps["height"] = "64px",
    userClasses: QToolbarProps["userClasses"] = undefined,
    userStyles: QToolbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  $: classes = createClasses([
    $ctx?.header && "q-header",
    "q-toolbar",
    "surface",
    $ctx?.header?.fixed && "fixed",
    inset && "q-toolbar--inset",
    userClasses,
  ]);

  $: heightStyle = ctx === undefined ? (isNumber(height) ? `${height}px` : height) : undefined;

  $: if ($ctx?.header !== undefined) {
    if (userStyles?.includes("display: none")) {
      $ctx.header.display = false;
    } else {
      $ctx.header.display = true;
    }
  }

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
