<script lang="ts">
  import { setContext, untrack } from "svelte";
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

  let breadrumbElement: HTMLDivElement;

  $effect(() => {
    untrack(() => breadrumbElement.firstChild?.remove());
  });

  setContext(QBreadcrumbsCtxName.activeColor, activeColor);
  setContext(QBreadcrumbsCtxName.separator, { type: separator, color: separatorColor, gutter });

  Q.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<div bind:this={breadrumbElement} {...props} class="q-breadcrumbs" data-quaff>
  {@render children?.()}
</div>
