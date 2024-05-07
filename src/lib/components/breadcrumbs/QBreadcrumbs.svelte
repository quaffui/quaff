<svelte:options runes={true} />

<script lang="ts">
  import { setContext, untrack } from "svelte";
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

  __Quaff__.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<div bind:this={breadrumbElement} {...props} class="q-breadcrumbs" {...__Quaff__.classes}>
  {@render children?.()}
</div>

<style lang="scss">
  @import "./QBreadcrumbs.scss";
</style>
