<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QHeaderProps } from "./props";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import QToolbar from "../toolbar/QToolbar.svelte";

  export let inset: QHeaderProps["inset"] = false,
    elevate: QHeaderProps["elevate"] = false,
    border: QHeaderProps["border"] = false,
    userClasses: QHeaderProps["userClasses"] = undefined,
    userStyles: QHeaderProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  $: if ($ctx === undefined) {
    console.warn("QHeader should be used inside QLayout");
  }

  $: classes = createClasses([$ctx?.header?.fixed && "fixed"], {
    component: "q-header",
    userClasses,
  });

  $: if ($ctx?.header !== undefined) {
    if (userStyles?.includes("display: none")) {
      $ctx.header.display = false;
    } else {
      $ctx.header.display = true;
    }
  }
</script>

<QToolbar {inset} {elevate} {border} class={classes} role="header" {...$$restProps}>
  <slot />
</QToolbar>
