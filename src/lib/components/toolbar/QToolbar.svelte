<script lang="ts">
  import { stringifyClasses } from "$lib/utils/props";
  import { type QToolbarProps } from "./props";

  export let inset: QToolbarProps["inset"] = false,
    userClasses: QToolbarProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = stringifyClasses(["q-toolbar", inset && "q-toolbar--inset", userClasses]);
</script>

<header class={`fill ${userClasses}`} role="toolbar" {...$$restProps}>
  <nav>
    <slot />
  </nav>
</header>

<style lang="scss">
  .q-toolbar--inset {
    padding-left: 58px;
  }
</style>
