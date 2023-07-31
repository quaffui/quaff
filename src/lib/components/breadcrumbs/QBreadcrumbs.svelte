<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { onMount, setContext } from "svelte";
  import type { QBreadcrumbsProps } from "./props";

  export let separator: QBreadcrumbsProps["separator"] = "/",
    gutter: QBreadcrumbsProps["gutter"] = "sm",
    activeColor: QBreadcrumbsProps["activeColor"] = "primary",
    separatorColor: QBreadcrumbsProps["separatorColor"] = "outline",
    userClasses: QBreadcrumbsProps["userClasses"] = undefined;
  export { userClasses as class };

  let breadcrumbElement: HTMLDivElement;

  onMount(() => breadcrumbElement.firstChild?.remove());

  setContext("activeColor", activeColor);
  setContext("separator", { type: separator, color: separatorColor, gutter });

  $: classes = createClasses([], {
    component: "q-breadcrumbs",
    userClasses,
  });
</script>

<div class={classes} bind:this={breadcrumbElement}>
  <slot />
</div>
