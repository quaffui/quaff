<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { QScrollObserver } from "$lib";
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
  const scroll = $derived(
    reveal ? new QScrollObserver(`.q-footer--${uid} ~ .q-layout__content`) : undefined
  );

  const offset = $derived(scroll ? scroll.position + height : undefined);

  // Collapse the footer `${revealOffset}px` above the bottom of layout content when scrolling up
  const collapsed = $derived(
    reveal && scroll?.direction === "up" && offset! + revealOffset < contentScrollHeight
  );

  const leftOffset = $derived(footerContext.view.charAt(8) === "l");
  const rightOffset = $derived(footerContext.view.charAt(10) === "r");
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    footerContext.height = height;
    footerContext.collapsed = collapsed;
    footerContext.ready = true;
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    // Calculating the layout content's height
    const content = document.querySelector(`.q-footer--${uid} ~ .q-layout__content`);

    contentScrollHeight = content ? content.scrollHeight - content.clientHeight : 0;

    setTimeout(() => {
      if (footerEl) {
        footerEl.style.transition = "all 0.3s";
      }
    }, 100);

    return () => {
      footerContext.height = 0;
      footerContext.collapsed = false;
      footerContext.ready = false;
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
