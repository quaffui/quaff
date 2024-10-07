<script lang="ts">
  import { setContext, untrack } from "svelte";
  import "./QBreadcrumbs.scss";
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

  setContext("activeColor", activeColor);
  setContext("separator", { type: separator, color: separatorColor, gutter });

  Q.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<div bind:this={breadrumbElement} {...props} class="q-breadcrumbs" {...Q.classes}>
  {@render children?.()}
</div>
