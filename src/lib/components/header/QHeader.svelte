<!--
@component
QHeader is a top app bar for titles, navigation, and actions. It can be used independently or integrated with QLayout.
-->

<script lang="ts">
  import { onMount } from "svelte";
  import { useRevealScrollObserver } from "$composables";
  import { headerCtx } from "../layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";

  // #region:    --- Non-reactive variables
  const uid = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let headerEl = $state<HTMLElement>();
  let scrollPosition = $state(0);
  let isScrollingDown = $state(true);
  let isCompact = $state(false);
  let measuredHeight = $state<number>();

  const headerContext = headerCtx.get();
  // #endregion: --- Reactive variables

  // #region:    --- Props
  let {
    elevated = false,
    inset = false,
    reveal = false,
    revealOffset = 250,
    height,
    variant = "small",
    collapse = false,
    bordered = false,
    children,
    ...props
  }: QHeaderProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const isFlexible = $derived(variant !== "small");
  const layoutHeight = $derived(measuredHeight ?? height ?? 64);
  const revealObserver = useRevealScrollObserver(
    "header",
    uid,
    () => !!headerContext && (reveal || isFlexible)
  );
  const revealScroll = $derived(revealObserver.scroll);
  const isScrolled = $derived(isFlexible && (revealScroll?.position ?? 0) > 0);
  const isCollapsed = $derived(
    reveal && isScrollingDown && scrollPosition > layoutHeight + revealOffset
  );

  const leftOffset = $derived(headerContext?.view.charAt(0) === "l");

  const rightOffset = $derived(headerContext?.view.charAt(2) === "r");
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    const position = revealScroll?.position ?? 0;

    if (!isFlexible || !collapse || !headerContext || position === 0) {
      isCompact = false;
    } else if (!isCompact) {
      const content = headerEl?.parentElement?.querySelector<HTMLElement>(
        ":scope > .q-layout__content"
      );
      const expandedHeight = headerEl?.offsetHeight ?? 64;
      const scrollRange = content ? content.scrollHeight - content.clientHeight : 0;
      let reduction = Math.max(0, expandedHeight - (reveal ? 0 : 64));

      if (headerEl && !reveal && scrollRange <= reduction + 1) {
        // Wrapped compact text may be taller than 64px. Measure only when the
        // nominal height would prevent collapse, restoring geometry before paint.
        const inlineStyle = headerEl.style.cssText;
        headerEl.style.setProperty("transition", "none", "important");
        headerEl.classList.add("q-header--compact");
        reduction = Math.max(0, expandedHeight - headerEl.offsetHeight);
        headerEl.classList.remove("q-header--compact");
        void headerEl.offsetHeight;
        headerEl.style.cssText = inlineStyle;
      }

      // Leave scroll range for collapsing and, with reveal, hiding the remaining bar.
      isCompact = scrollRange > reduction + 1;
    }

    if (revealScroll?.direction === "up" && position > 0) {
      const content = headerEl?.parentElement?.querySelector<HTMLElement>(
        ":scope > .q-layout__content"
      );

      // Growing the viewport can clamp its scroll position without the user scrolling up.
      if (content && position >= content.scrollHeight - content.clientHeight) {
        return;
      }
    }

    scrollPosition = position;
    isScrollingDown = revealScroll?.direction === "down";
  });

  $effect.pre(() => {
    if (!headerContext) {
      return;
    }

    // Track readiness so a resumed bar can reclaim layout state.
    if (!headerContext.ready || headerContext.ownerId !== uid) {
      headerCtx.updateEntry(headerContext, "ownerId", uid);
    }

    headerCtx.updateEntries(headerContext, {
      height: layoutHeight,
      collapsed: isCollapsed,
      ready: !isFlexible || measuredHeight !== undefined,
    });
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => () => {
    if (headerContext?.ownerId === uid) {
      headerCtx.updateEntries(headerContext, {
        ownerId: "",
        height: 0,
        collapsed: false,
        ready: false,
      });
    }
  });
  // #endregion: --- Lifecycle

  Q.classes("q-header", {
    bemClasses: {
      [uid]: true,
      [variant]: true,
      flexible: isFlexible,
      collapsible: isFlexible && collapse,
      compact: isCompact,
      scrolled: isScrolled,
      elevated,
      bordered,
      collapsed: isCollapsed,
      "offset-left": leftOffset,
      "offset-right": rightOffset,
      inset,
      layout: !!headerContext,
    },
    classes: [props.class],
    isCustomComponent: true,
  });
</script>

{#if headerContext}
  <!-- Context is fixed: keep controls mounted and avoid size observers for standalone headers. -->
  <header
    bind:this={headerEl}
    bind:offsetHeight={measuredHeight}
    {...props}
    class="q-header"
    style:--header-height={height === undefined ? undefined : `${height}px`}
    data-quaff
  >
    {@render children?.()}
  </header>
{:else}
  <header
    bind:this={headerEl}
    {...props}
    class="q-header"
    style:--header-height={height === undefined ? undefined : `${height}px`}
    data-quaff
  >
    {@render children?.()}
  </header>
{/if}
