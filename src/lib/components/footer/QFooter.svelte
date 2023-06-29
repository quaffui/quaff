<script lang="ts">
  import { getContext } from "svelte";
  import type { QFooterProps } from "./props";
  import { createClasses } from "$lib/utils/props";
  import type { AppbarContext } from "../layout/QLayout.svelte";

  export let value: QFooterProps["value"] = true,
    bordered: QFooterProps["bordered"] = false,
    elevated: QFooterProps["elevated"] = false,
    height: QFooterProps["height"] = undefined,
    userClasses: QFooterProps["userClasses"] = undefined,
    userStyles: QFooterProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: ctx = getContext<AppbarContext>("footer");

  $: classes = createClasses(["q-footer", ctx?.fixed && "fixed", userClasses]);
</script>

<footer class={classes} style={userStyles}>
  <nav>
    <slot />
  </nav>
</footer>
