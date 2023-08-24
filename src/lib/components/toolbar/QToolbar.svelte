<script lang="ts">
  import { useSize } from "$lib/composables";
  import { createClasses, createStyles } from "$lib/utils";
  import type { QToolbarProps } from "./props";

  export let inset: QToolbarProps["inset"] = false,
    border: QToolbarProps["border"] = false,
    elevate: QToolbarProps["elevate"] = false,
    height: QToolbarProps["height"] = "64px",
    userClasses: QToolbarProps["userClasses"] = undefined,
    userStyles: QToolbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: classes = createClasses([inset && "inset", elevate && "elevated", border && "bordered"], {
    component: "q-toolbar",
    userClasses,
  });

  $: style = createStyles(
    {
      height: !userClasses?.includes("q-header") && useSize(height).style,
    },
    userStyles
  );
</script>

<header class={classes} role="toolbar" {...$$restProps} {style}>
  <nav>
    <slot />
  </nav>
</header>
