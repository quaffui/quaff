<script lang="ts">
  import { isRouteActive } from "$utils/router";
  import { getContext, type Snippet } from "svelte";
  import type { BreadcrumbsElProps } from "./props";
  import { derived } from "svelte/store";
  import Icon from "../icon/Icon.svelte";

  let {
    activeClass = "active",
    href,
    label = "",
    icon,
    tag = "div",
    to,
    children = fallback,
    ...props
  }: BreadcrumbsElProps = $props();

  const activeColor = getContext<string>("activeColor");
  const separator = getContext<{ type: string | Snippet; color: string; gutter: string }>(
    "separator"
  );

  const classesIfActive = derived(isRouteActive, ($isRouteActive) =>
    $isRouteActive(href || to) ? `${activeClass} text-${activeColor}` : undefined
  );

  Quaff.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${separator.gutter}`, props.class],
  });
  Quaff.classes("q-breadcrumbs__el", { classes: [$classesIfActive] });
</script>

{#snippet fallback()}
  {label}
{/snippet}

{#snippet breadcrumbEl()}
  {#if icon !== undefined}
    {#if typeof icon === "string"}
      <Icon name={icon} size="1rem" />
    {:else}
      {@render icon()}
    {/if}
  {/if}

  {@render children()}
{/snippet}

<div {...props} class="q-breadcrumbs__separator" {...Quaff.classes}>
  {#if typeof separator.type === "string"}
    {#if separator.type.startsWith("icon:")}
      <Icon name={separator.type.replace("icon:", "")} size="1rem" />
    {:else}
      {separator.type}
    {/if}
  {:else}
    {@render separator.type()}
  {/if}
</div>

{#if href !== undefined || to !== undefined}
  <a href={href || to} class="q-breadcrumbs__el" {...Quaff.classes}>
    {@render breadcrumbEl()}
  </a>
{:else}
  <svelte:element this={tag} class="q-breadcrumbs__el" {...Quaff.classes}>
    {@render breadcrumbEl()}
  </svelte:element>
{/if}

<style lang="scss">
  @import "./breadcrumbsEl.scss";
</style>
