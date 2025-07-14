<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { QBreadcrumbsCtxName } from "$utils";
  import type { QBreadcrumbsProps } from "./props";

  let {
    activeColor = "primary",
    gutter = "sm",
    separator = "/",
    separatorColor = "outline",
    children,
    ...props
  }: QBreadcrumbsProps = $props();

  let breadcrumbList: HTMLOListElement;

  onMount(() => {
    breadcrumbList.querySelector(".q-breadcrumbs__separator:first-child")?.remove();
  });

  setContext(QBreadcrumbsCtxName.separator, { type: separator, gutter });

  Q.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<nav
  {...props}
  class="q-breadcrumbs"
  aria-label="Breadcrumbs"
  style:--q-separator-color="var(--{separatorColor}, {separatorColor})"
  style:--q-active-color="var(--{activeColor}, {activeColor})"
>
  <ol bind:this={breadcrumbList} class="q-breadcrumbs__list">
    {@render children?.()}
  </ol>
</nav>
