<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { QBreadcrumbsProps } from "./props";

  export let separator: QBreadcrumbsProps["separator"] = "/",
    gutter: QBreadcrumbsProps["gutter"] = "sm",
    activeColor: QBreadcrumbsProps["activeColor"] = "primary",
    separatorColor: QBreadcrumbsProps["separatorColor"] = "outline",
    userClasses: QBreadcrumbsProps["userClasses"] = "";
  export { userClasses as class };

  let breadcrumbElement: HTMLDivElement;

  onMount(() => breadcrumbElement.firstChild?.remove());

  setContext("activeColor", activeColor);
  setContext("separator", { type: separator, color: separatorColor, gutter });
</script>

<div class="q-breadcrumbs {userClasses}" bind:this={breadcrumbElement}>
  <slot />
</div>
