<script lang="ts" module>
  import { QContext } from "$lib/utils";

  interface QItemContext {
    readonly activeClass: string | false;
    multiline: boolean;
  }

  export const itemCtx = QContext<QItemContext>("QItem");
</script>

<script lang="ts">
  import { ripple } from "$helpers";
  import { getRouterInfo, isRouteActive } from "$utils";
  import QSeparator from "../separator/QSeparator.svelte";
  import { listCtx } from "./QList.svelte";
  import type { QItemProps } from "./props";

  // #region:    --- Props
  let {
    tag = "div",
    active = false,
    clickable = false,
    dense = false,
    tabindex = 0,
    href,
    to,
    disabled = false,
    activeClass = "active",
    replace = false,
    noRipple = false,
    children,
    ...props
  }: QItemProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let multiline = $state(false);

  const ctx = listCtx.assertGet("QItem should be used inside QList");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const routerInfo = $derived(
    getRouterInfo({
      href,
      to,
      disabled,
      activeClass,
      replace,
    })
  );

  const activeClassToUse = $derived(
    activeClass === "active" ? ctx.activeClass || activeClass : activeClass
  );

  const isActionable = $derived(clickable || routerInfo.hasLink || tag === "label");
  const isClickable = $derived(isActionable && !disabled);

  const isActive = $derived(isRouteActive(to || href) || active);
  // #endregion: --- Derived values

  // #region:    --- Context
  itemCtx.set({
    multiline,
    activeClass: active && activeClassToUse,
  });
  // #endregion: --- Context

  Q.classes("q-item", {
    bemClasses: {
      multiline,
      dense,
      active: isActive,
      clickable,
    },
    classes: [routerInfo.linkClasses, isActive && activeClassToUse, props.class],
  });
</script>

{#if ctx.separatorOptions}
  <QSeparator {...ctx.separatorOptions} />
{/if}

{#if routerInfo.linkAttributes.href}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <a
    use:ripple={{ disabled: !isClickable || noRipple }}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    {...routerInfo.linkAttributes}
    data-quaff
  >
    {@render children?.()}
  </a>
{:else}
  <svelte:element
    this={tag}
    use:ripple={{ disabled: !isClickable || noRipple }}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    data-quaff
  >
    {@render children?.()}
  </svelte:element>
{/if}
