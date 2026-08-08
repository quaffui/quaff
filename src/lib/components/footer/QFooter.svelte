<script lang="ts">
  import { onMount } from "svelte";
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
  let contentScrollHeight = $state(0);

  const footerContext = footerCtx.assertGet("QFooter should be used inside QLayout");
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const revealObserver = useRevealScrollObserver("footer", uid, () => reveal && value);
  const revealScroll = $derived(revealObserver.scroll);

  const offset = $derived(revealScroll ? revealScroll.position + height : undefined);

  // Collapse the footer `${revealOffset}px` above the bottom of layout content when scrolling up
  const collapsed = $derived(
    !value || (revealScroll?.direction === "up" && offset! + revealOffset < contentScrollHeight)
  );

  const leftOffset = $derived(footerContext.view.charAt(8) === "l");
  const rightOffset = $derived(footerContext.view.charAt(10) === "r");
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    footerCtx.updateEntries({
      height,
      collapsed,
      ready: true,
    });
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    const content = footerEl?.parentElement?.querySelector<HTMLElement>(
      ":scope > .q-layout__content"
    );
    const updateContentScrollHeight = () => {
      contentScrollHeight = content
        ? content.scrollHeight - content.clientHeight + (collapsed ? height : 0)
        : 0;
    };
    const contentResizeObserver = new ResizeObserver(updateContentScrollHeight);

    updateContentScrollHeight();

    if (content) {
      contentResizeObserver.observe(content);
    }

    setTimeout(() => {
      if (footerEl) {
        footerEl.style.transition = "all 0.3s";
      }
    }, 100);

    return () => {
      contentResizeObserver.disconnect();

      footerCtx.updateEntries({
        height: 0,
        collapsed: false,
        ready: false,
      });
    };
  });
  // #endregion: --- Lifecycle

  Q.classes("q-footer", {
    bemClasses: {
      [uid]: true,
      collapsed,
      bordered,
      "offset-left": leftOffset,
      "offset-right": rightOffset,
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
    data-quaff
  >
    {@render children?.()}
  </footer>
{/if}
