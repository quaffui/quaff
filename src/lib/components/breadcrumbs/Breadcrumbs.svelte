<script lang="ts">
  import { setContext, untrack } from "svelte";
  import type { BreadcrumbsProps } from "./props";

  let {
    activeColor = "primary",
    gutter = "sm",
    separator = "/",
    separatorColor = "outline",
    children,
    ...props
  }: BreadcrumbsProps = $props();

  let breadrumbElement: HTMLDivElement;

  $effect(() => {
    untrack(() => breadrumbElement.firstChild?.remove());
  });

  setContext("activeColor", activeColor);
  setContext("separator", { type: separator, color: separatorColor, gutter });

  Quaff.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<div bind:this={breadrumbElement} {...props} class="q-breadcrumbs" {...Quaff.classes}>
  {@render children?.()}
</div>

<style lang="scss">
  @import "./breadcrumbs.scss";
</style>
