<script lang="ts">
  import { page } from "$app/state";
  import { getRouterInfo } from "$utils/router";
  import QIcon from "$components/icon/QIcon.svelte";
  import { breadcrumbsCtx } from "./QBreadcrumbs.svelte";
  import type { MaterialSymbol } from "material-symbols";
  import type { QBreadcrumbsElProps } from "./props";

  // #region:    --- Props
  let {
    label = "",
    icon,
    tag = "span",
    children,
    target,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    "aria-current": ariaCurrent,
    ...props
  }: QBreadcrumbsElProps = $props();
  // #endregion: --- Props

  // #region:    --- Context
  const ctx = breadcrumbsCtx.assertGet();
  // #endregion: --- Context

  // #region:    --- Derived values
  const routerInfo = $derived(getRouterInfo(props));
  const activeClass = $derived(props.activeClass ?? ctx.activeClass);
  const linkAttributes = $derived({ ...routerInfo.linkAttributes, target });
  const hideIcon = $derived(!!(ariaLabel || ariaLabelledby || (!children && label)));
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

<li
  {...props}
  class="q-breadcrumbs__item"
  {style}
  aria-label={routerInfo.hasLink ? undefined : ariaLabel}
  aria-labelledby={routerInfo.hasLink ? undefined : ariaLabelledby}
  aria-describedby={routerInfo.hasLink ? undefined : ariaDescribedby}
>
  <span class="q-breadcrumbs__separator" aria-hidden="true">
    {#if typeof ctx.separator === "string"}
      {#if ctx.separator.startsWith("icon:")}
        <QIcon name={ctx.separator.slice(5) as MaterialSymbol} size="sm" />
      {:else}
        {ctx.separator}
      {/if}
    {:else}
      {@render ctx.separator?.()}
    {/if}
  </span>

  <svelte:element
    this={routerInfo.hasLink ? "a" : tag}
    {...routerInfo.hasLink ? linkAttributes : {}}
    class="q-breadcrumbs__el"
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={ariaDescribedby}
    aria-current={ariaCurrent ??
      (routerInfo.linkAttributes.href === page.url.pathname ? "page" : undefined)}
    data-quaff
  >
    {#if icon !== undefined}
      <QIcon
        size="sm"
        name={typeof icon === "string" ? icon : undefined}
        children={typeof icon === "string" ? undefined : icon}
        aria-hidden={hideIcon}
      />
    {/if}

    <span class="q-breadcrumbs__label">
      {#if children}
        {@render children()}
      {:else}
        {label}
      {/if}
    </span>
  </svelte:element>
</li>
