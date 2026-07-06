<script lang="ts">
  import { getRouterInfo } from "$utils";
  import QIcon from "$components/icon/QIcon.svelte";
  import { breadcrumbsCtx } from "./QBreadcrumbs.svelte";
  import type { MaterialSymbol } from "material-symbols";
  import type { QBreadcrumbsElProps } from "./props";

  // #region:    --- Props
  let {
    label = "",
    icon,
    tag = "span",
    children = fallback,
    ...props
  }: QBreadcrumbsElProps = $props();
  // #endregion: --- Props

  // #region:    --- Context
  const ctx = breadcrumbsCtx.assertGet();
  // #endregion: --- Context

  // #region:    --- Derived values
  const routerInfo = $derived(getRouterInfo(props));
  const activeClass = $derived(props.activeClass ?? ctx.activeClass);
  const style = $derived(
    [
      routerInfo.isActive && (props.activeStyle ?? ctx.activeStyle),
      routerInfo.isActive && "--q-breadcrumbs-color: var(--q-active-color)",
      props.style,
    ]
      .filter(Boolean)
      .join("; ")
  );
  // #endregion: --- Derived values

  Q.classes("q-breadcrumbs__item", { classes: [props.class] });
  Q.classes("q-breadcrumbs__separator", {
    classes: [`q-px-${ctx.gutter}`],
  });
  Q.classes("q-breadcrumbs__el", {
    classes: [routerInfo.linkClass, routerInfo.isActive && activeClass],
  });
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

<li {...props} class="q-breadcrumbs__item" {style}>
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

  {#if routerInfo.hasLink}
    <a
      {...routerInfo.linkAttributes}
      class="q-breadcrumbs__el"
      aria-current={routerInfo.isActive ? "page" : undefined}
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
