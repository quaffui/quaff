<script lang="ts">
  import { onMount } from "svelte";
  import { on } from "svelte/events";
  import { useRevealScrollObserver } from "$composables";
  import { footerCtx } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(true),
    bordered = false,
    reveal = false,
    revealOffset = 250,
    height = 80,
    children,
    ...props
  }: QFooterProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const uid = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let footerEl = $state<HTMLElement>();
  let scrollRange = $state(0);

  const footerContext = footerCtx.assertGet("QFooter should be used inside QLayout");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const revealObserver = useRevealScrollObserver("footer", uid, () => reveal && value);
  const revealScroll = $derived(revealObserver.scroll);

  let isCollapsed = $derived.by(() => {
    if (!value) {
      return true;
    }

    const isScrollingDown = revealScroll?.direction === "down" && revealScroll.delta > 0;

    if (!isScrollingDown) {
      return false;
    }

    const isBeforeRevealThreshold = revealScroll.position + revealOffset < scrollRange;
    return isBeforeRevealThreshold && !footerEl?.matches(":focus-within");
  });
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    // Track readiness so a resumed bar can reclaim layout state.
    if (!footerContext.ready || footerContext.ownerId !== uid) {
      footerCtx.updateEntry(footerContext, "ownerId", uid);
    }

    footerCtx.updateEntries(footerContext, {
      height,
      collapsed: isCollapsed,
      ready: true,
    });
  });

  $effect(() => {
    const footer = footerEl;

    if (!reveal || !footer) {
      return;
    }

    const content = footer.parentElement?.querySelector<HTMLElement>(":scope > .q-layout__content");

    if (!content) {
      return;
    }

    const updateScrollRange = () => {
      const availableHeight = footer.offsetTop + footer.offsetHeight - content.offsetTop;
      scrollRange = content.scrollHeight - availableHeight;
    };
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(updateScrollRange);
    });
    const stopScroll = on(content, "scroll", updateScrollRange);
    observer.observe(content);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      stopScroll();
    };
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => () => {
    if (footerContext.ownerId === uid) {
      footerCtx.updateEntries(footerContext, {
        ownerId: "",
        height: 0,
        collapsed: false,
        ready: false,
      });
    }
  });
  // #endregion: --- Lifecycle

  Q.classes("q-footer", {
    bemClasses: {
      [uid]: true,
      collapsed: isCollapsed,
      bordered,
      "offset-left": footerContext.view.charAt(8) === "l",
      "offset-right": footerContext.view.charAt(10) === "r",
    },
    classes: [props.class],
  });
</script>

{#if value}
  <footer
    bind:this={footerEl}
    {...props}
    class="q-footer"
    style:--footer-height="{height}px"
    onfocusin={(event) => {
      isCollapsed = false;
      props.onfocusin?.(event);
    }}
    data-quaff
  >
    {@render children?.()}
  </footer>
{/if}
