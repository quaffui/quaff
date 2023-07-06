<script lang="ts">
  import { getContext } from "svelte";
  import type { QFooterProps } from "./props";
  import { createClasses } from "$lib/utils/props";
  import type { AppbarContext, LayoutContext } from "../layout/QLayout.svelte";

  export let value: QFooterProps["value"] = true,
    bordered: QFooterProps["bordered"] = false,
    elevated: QFooterProps["elevated"] = false,
    height: QFooterProps["height"] = undefined,
    userClasses: QFooterProps["userClasses"] = undefined,
    userStyles: QFooterProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  $: classes = createClasses(["q-footer", $ctx && $ctx.footer.fixed && "fixed", userClasses]);
</script>

<footer class={classes} style={userStyles}>
  <nav>
    <slot />
  </nav>
</footer>
