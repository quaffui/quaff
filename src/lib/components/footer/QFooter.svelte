<script lang="ts">
  import { useSize } from "$lib/composables";
  import { createClasses, createStyles } from "$lib/utils";
  import { getContext } from "svelte";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";

  export let value: QFooterProps["value"] = true,
    border: QFooterProps["border"] = false,
    elevate: QFooterProps["elevate"] = false,
    height: QFooterProps["height"] = undefined,
    userClasses: QFooterProps["userClasses"] = undefined,
    userStyles: QFooterProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  $: classes = createClasses(
    [border && "bordered", elevate && "elevated", $ctx?.footer?.fixed && "fixed"],
    {
      component: "q-footer",
      userClasses,
    }
  );

  $: style = createStyles(
    {
      height: !ctx && useSize(height).style,
    },
    userStyles
  );
</script>

<footer class={classes} {style}>
  <nav>
    <slot />
  </nav>
</footer>
