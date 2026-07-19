<script lang="ts" module>
  import { QContext } from "$utils/context";

  interface QItemContext {
    readonly activeClass: string | undefined;
    lineCount: number;
  }

  export const itemCtx = QContext<QItemContext>("QItem");
</script>

<script lang="ts">
  import { ripple } from "$helpers";
  import { getRouterInfo, isActivationKey } from "$utils";
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
    dragged = false,
    draggable,
    disabled = false,
    activeStyle,
    noRipple = false,
    children,
    onclick,
    onkeydown,
    ondragstart,
    ondragend,
    ...props
  }: QItemProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let lineCount = $state(1);
  let nativeDragged = $state(false);

  const ctx = listCtx.assertGet("QItem should be used inside QList");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const routerInfo = $derived(getRouterInfo(props));

  const isActive = $derived(routerInfo.isActive || active);

  const isActionable = $derived(
    clickable || routerInfo.hasLink || tag === "button" || tag === "label"
  );

  const isClickable = $derived(isActionable && !disabled);
  const isDraggable = $derived(!!draggable && !disabled);
  const isDragged = $derived(dragged || nativeDragged);
  const activeClass = $derived((isActive && (props.activeClass ?? ctx.activeClass)) || undefined);

  const style = $derived(
    [isActive && (ctx.activeStyle ?? activeStyle), props.style].filter(Boolean).join("; ") ||
      undefined
  );

  const role = $derived.by(() => {
    if (props.role !== undefined) {
      return props.role;
    }

    if (ctx.selection) {
      return "option";
    }

    if (isActionable && !routerInfo.hasLink && tag !== "button" && tag !== "label") {
      return "button";
    }
  });

  const ariaSelected = $derived(ctx.selection ? isActive : (props["aria-selected"] ?? undefined));
  // #endregion: --- Derived values

  // #region:    --- Context
  itemCtx.set({
    lineCount,
    activeClass,
  });
  // #endregion: --- Context

  Q.classes("q-item", {
    bemClasses: {
      multiline: lineCount > 1,
      "three-line": lineCount > 2,
      dense,
      active: isActive,
      clickable: clickable || tag === "button",
      dragged: isDragged,
    },
    classes: [routerInfo.linkClass, activeClass, props.class],
  });

  // #region:    --- Functions
  function handleClick(event: MouseEvent & { currentTarget: HTMLElement }) {
    if (disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    onclick?.(event);
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
    onkeydown?.(event);

    if (event.defaultPrevented || !isClickable || !isActivationKey(event)) {
      return;
    }

    const isNativeActivation = tag === "button" || (routerInfo.hasLink && event.code === "Enter");
    if (!isNativeActivation) {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  function handleDragstart(event: DragEvent & { currentTarget: HTMLElement }) {
    ondragstart?.(event);
    nativeDragged = isDraggable && !event.defaultPrevented;
  }

  function handleDragend(event: DragEvent & { currentTarget: HTMLElement }) {
    nativeDragged = false;
    ondragend?.(event);
  }
  // #endregion: --- Functions
</script>

{#if ctx.separatorOptions}
  <QSeparator {...ctx.separatorOptions} />
{/if}

{#if routerInfo.hasLink}
  <!-- eslint-disable svelte/no-navigation-without-resolve -- Link attributes are normalized by getRouterInfo. -->
  <a
    {...props}
    class="q-item"
    {role}
    aria-selected={ariaSelected}
    tabindex={isClickable ? tabindex || 0 : undefined}
    aria-disabled={disabled || undefined}
    draggable={isDraggable || undefined}
    {...routerInfo.linkAttributes}
    href={disabled ? undefined : routerInfo.linkAttributes.href}
    data-quaff
    {style}
    onclick={handleClick}
    onkeydown={handleKeydown}
    ondragstart={handleDragstart}
    ondragend={handleDragend}
    {@attach ripple({ disabled: !isClickable || noRipple })}
  >
    {@render children?.()}
  </a>
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
  <svelte:element
    this={tag}
    {...props}
    class="q-item"
    {role}
    aria-selected={ariaSelected}
    tabindex={isClickable ? tabindex || 0 : tag === "button" && disabled ? -1 : undefined}
    aria-disabled={disabled || undefined}
    draggable={isDraggable || undefined}
    {...routerInfo.linkAttributes}
    data-quaff
    {style}
    onclick={handleClick}
    onkeydown={handleKeydown}
    ondragstart={handleDragstart}
    ondragend={handleDragend}
    {@attach ripple({ disabled: !isClickable || noRipple })}
  >
    {@render children?.()}
  </svelte:element>
{/if}
