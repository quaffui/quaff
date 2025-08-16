<script lang="ts">
  import { QIcon } from "$lib";
  import { isRouteActive } from "$utils";
  import { breadcrumbsCtx } from "./QBreadcrumbs.svelte";
  import type { MaterialSymbol } from "material-symbols";
  import type { QBreadcrumbsElProps } from "./props";

  // #region:    --- Props
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
  // #endregion: --- Props

  // #region:    --- Derived values
  const isActive = $derived(isRouteActive(href || to));
  // #endregion: --- Derived values

  // #region:    --- Context
  const ctx = breadcrumbsCtx.assertGet();
  // #endregion: --- Context

  Q.classes("q-breadcrumbs__item", { classes: [props.class] });
  Q.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${ctx?.gutter}`],
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
    {#if typeof ctx.separator === "string"}
      {#if ctx.separator.startsWith("icon:")}
        <QIcon name={ctx.separator.slice(5) as MaterialSymbol} size="1rem" />
      {:else}
        {ctx.separator}
      {/if}
    {:else}
      {@render ctx.separator?.()}
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
