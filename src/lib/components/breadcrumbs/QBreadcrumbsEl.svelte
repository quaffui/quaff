<svelte:options runes={true} />

<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { derived } from "svelte/store";
  import { isRouteActive } from "$utils/router";
  import QIcon from "../icon/QIcon.svelte";
  import type { QBreadcrumbsElProps } from "./props";

  let {
    activeClass = "active",
    href,
    label = "",
    icon,
    tag = "div",
    to,
    children = fallback,
    ...props
  }: QBreadcrumbsElProps = $props();

  const activeColor = getContext<string>("activeColor");
  const separator = getContext<{ type: string | Snippet; color: string; gutter: string }>(
    "separator"
  );

  const classesIfActive = derived(isRouteActive, ($isRouteActive) =>
    $isRouteActive(href || to) ? `${activeClass} text-${activeColor}` : undefined
  );

  Q.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${separator.gutter}`, props.class],
  });
  Q.classes("q-breadcrumbs__el", { classes: [$classesIfActive] });
</script>

{#snippet fallback()}
  {label}
{/snippet}

{#snippet breadcrumbEl()}
  {#if icon !== undefined}
    {#if typeof icon === "string"}
      <QIcon name={icon} size="1rem" />
    {:else}
      {@render icon()}
    {/if}
  {/if}

  {@render children()}
{/snippet}

<div {...props} class="q-breadcrumbs__separator" {...Q.classes}>
  {#if typeof separator.type === "string"}
    {#if separator.type.startsWith("icon:")}
      <QIcon name={separator.type.replace("icon:", "")} size="1rem" />
    {:else}
      {separator.type}
    {/if}
  {:else}
    {@render separator.type()}
  {/if}
</div>

{#if href !== undefined || to !== undefined}
  <a href={href || to} class="q-breadcrumbs__el" {...Q.classes}>
    {@render breadcrumbEl()}
  </a>
{:else}
  <svelte:element this={tag} class="q-breadcrumbs__el" {...Q.classes}>
    {@render breadcrumbEl()}
  </svelte:element>
{/if}

<style lang="scss">
  @import "./QBreadcrumbsEl.scss";
</style>
