<script lang="ts">
  import { getContext } from "svelte";
  import type { QFooterProps } from "./props";
  import { createClasses, createStyles } from "$lib/utils/props";
  import type { AppbarContext, LayoutContext } from "../layout/QLayout.svelte";
  import { useSize } from "$lib/composables/use-size";

  export let value: QFooterProps["value"] = true,
    bordered: QFooterProps["bordered"] = false,
    elevated: QFooterProps["elevated"] = false,
    height: QFooterProps["height"] = undefined,
    userClasses: QFooterProps["userClasses"] = undefined,
    userStyles: QFooterProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  $: heightStyle = $ctx && useSize(height).style;

  $: classes = createClasses(["q-footer", $ctx && $ctx.footer?.fixed && "fixed", userClasses]);

  $: style = createStyles(
    {
      "--footer-height": heightStyle,
    },
    userStyles
  );
</script>

<footer class={classes} {style}>
  <nav>
    <slot />
  </nav>
</footer>
