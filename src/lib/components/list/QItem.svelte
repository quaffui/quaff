<script lang="ts" module>
  import { QContext } from "$utils/context";

  interface QItemContext {
    readonly activeClass: string | undefined;
    multiline: boolean;
  }

  export const itemCtx = QContext<QItemContext>("QItem");
</script>

<script lang="ts">
  import { ripple } from "$helpers";
  import { getRouterInfo } from "$utils";
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
    disabled = false,
    activeStyle,
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
  const routerInfo = $derived(getRouterInfo(props));

  const isActive = $derived(routerInfo.isActive || active);
  const isActionable = $derived(clickable || routerInfo.hasLink || tag === "label");
  const isClickable = $derived(isActionable && !disabled);

  const activeClass = $derived((isActive && (props.activeClass ?? ctx.activeClass)) || undefined);
  const style = $derived(
    [isActive && (ctx.activeStyle ?? activeStyle), props.style].filter(Boolean).join("; ") ||
      undefined
  );
  // #endregion: --- Derived values

  // #region:    --- Context
  itemCtx.set({
    multiline,
    activeClass,
  });
  // #endregion: --- Context

  Q.classes("q-item", {
    bemClasses: {
      multiline,
      dense,
      active: isActive,
      clickable,
    },
    classes: [routerInfo.linkClass, activeClass, props.class],
  });
</script>

{#if ctx.separatorOptions}
  <QSeparator {...ctx.separatorOptions} />
{/if}

{#if routerInfo.hasLink}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <a
    {@attach ripple({ disabled: !isClickable || noRipple })}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    {...routerInfo.linkAttributes}
    data-quaff
    {style}
  >
    {@render children?.()}
  </a>
{:else}
  <svelte:element
    this={tag}
    {@attach ripple({ disabled: !isClickable || noRipple })}
    {...props}
    class="q-item"
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={isActionable && disabled ? true : undefined}
    {...routerInfo.linkAttributes}
    data-quaff
    {style}
  >
    {@render children?.()}
  </svelte:element>
{/if}
