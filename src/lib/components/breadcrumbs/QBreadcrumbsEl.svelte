<svelte:options runes={true} />

<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { isRouteActive } from "$utils/router";
  import { QBreadcrumbsCtxName } from "$utils/context";
  import QIcon from "../icon/QIcon.svelte";
  import type { MaterialSymbol } from "material-symbols";
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

  const activeColor = getContext<string>(QBreadcrumbsCtxName.activeColor);
  const separator = getContext<{
    type: `icon:${MaterialSymbol}` | Snippet;
    color: string;
    gutter: string;
  }>(QBreadcrumbsCtxName.separator);

  const classesIfActive = $derived(
    isRouteActive(href || to) ? `${activeClass} text-${activeColor}` : undefined
  );

  Q.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${separator.gutter}`, props.class],
  });
  Q.classes("q-breadcrumbs__el", { classes: [classesIfActive] });
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

<div {...props} class="q-breadcrumbs__separator" data-quaff>
  {#if typeof separator.type === "string"}
    {#if separator.type.startsWith("icon:")}
      <QIcon name={separator.type.replace("icon:", "") as MaterialSymbol} size="1rem" />
    {:else}
      {separator.type}
    {/if}
  {:else}
    {@render separator.type()}
  {/if}
</div>

{#if href !== undefined || to !== undefined}
  <a href={href || to} class="q-breadcrumbs__el">
    {@render breadcrumbEl()}
  </a>
{:else}
  <svelte:element this={tag} class="q-breadcrumbs__el">
    {@render breadcrumbEl()}
  </svelte:element>
{/if}
