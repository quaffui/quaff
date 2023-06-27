<script lang="ts">
  import { getContext } from "svelte";
  import type { QFooterProps } from "./props";
  import { createClasses } from "$lib/utils/props";
  import type { AppbarContext } from "../layout/QLayout.svelte";

  export let value: QFooterProps["value"] = true,
    bordered: QFooterProps["bordered"] = false,
    elevated: QFooterProps["elevated"] = false,
    height: QFooterProps["height"] = undefined,
    userClasses: QFooterProps["userClasses"] = undefined;
  export { userClasses as class };

  $: ctx = getContext<AppbarContext>("footer");

  $: classes = createClasses(["q-footer", ctx?.fixed && "fixed", userClasses]);
</script>

<footer class={classes}>
  <nav>
    <slot />
  </nav>
</footer>

<style lang="scss">
  .q-footer {
    width: 100%;
    height: 5rem;
    transition: all var(--speed3);
  }
</style>
