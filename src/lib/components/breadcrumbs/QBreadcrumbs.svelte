<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { setContext } from "svelte";
  import type { QBreadcrumbsProps } from "./props";
  import { setIndex } from "$lib/composables/use-index";

  export let separator: QBreadcrumbsProps["separator"] = "/",
    gutter: QBreadcrumbsProps["gutter"] = "sm",
    activeColor: QBreadcrumbsProps["activeColor"] = "primary",
    separatorColor: QBreadcrumbsProps["separatorColor"] = "outline",
    userClasses: QBreadcrumbsProps["userClasses"] = undefined;
  export { userClasses as class };

  setContext("activeColor", activeColor);
  setContext("separator", { type: separator, color: separatorColor, gutter });

  let elIndex = -1;
  setIndex(elIndex);

  $: classes = createClasses(["q-breadcrumbs flex center-align middle-align", userClasses]);
</script>

<div class={classes}>
  <slot />
</div>
