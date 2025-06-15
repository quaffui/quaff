<script lang="ts">
  import { getContext } from "svelte";
  import { QIcon } from "$lib";
  import { isRouteActive, QBreadcrumbsCtxName } from "$utils";
  import type { MaterialSymbol } from "material-symbols";
  import type { QBreadcrumbsElProps, QBreadcrumbsProps } from "./props";

  let {
    activeClass = "active",
    href,
    label = "",
    icon,
    tag = "span",
    to,
    children = fallback,
    ...props
  }: QBreadcrumbsElProps = $props();

  const separator = getContext<{
    type: QBreadcrumbsProps["separator"];
    gutter: QBreadcrumbsProps["gutter"];
  }>(QBreadcrumbsCtxName.separator);

  const isActive = $derived(isRouteActive(href || to));

  Q.classes("q-breadcrumbs__item", { classes: [props.class] });
  Q.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${separator.gutter}`],
  });
  Q.classes("q-breadcrumbs__el", { classes: [isActive && activeClass] });
</script>

{#snippet fallback()}
  {label}
{/snippet}

{#snippet breadcrumbEl()}
  {#if icon !== undefined}
    {#if typeof icon === "string"}
      <QIcon name={icon} size="1rem" />
    {:else}
      <span class="q-icon">
        {@render icon()}
      </span>
    {/if}
  {/if}

  <span class="q-breadcrumbs__label">
    {@render children()}
  </span>
{/snippet}

<li
  {...props}
  class="q-breadcrumbs__item"
  style:--q-breadcrumbs-color={isActive ? "var(--q-active-color)" : undefined}
>
  <span class="q-breadcrumbs__separator" aria-hidden="true">
    {#if typeof separator.type === "string"}
      {#if separator.type.startsWith("icon:")}
        <QIcon name={separator.type.slice(5) as MaterialSymbol} size="1rem" />
      {:else}
        {separator.type}
      {/if}
    {:else}
      {@render separator.type?.()}
    {/if}
  </span>

  {#if href || to}
    <a
      href={href || to}
      class="q-breadcrumbs__el"
      aria-current={isActive ? "page" : undefined}
      data-quaff
    >
      {@render breadcrumbEl()}
    </a>
  {:else}
    <svelte:element this={tag} class="q-breadcrumbs__el" data-quaff>
      {@render breadcrumbEl()}
    </svelte:element>
  {/if}
</li>
