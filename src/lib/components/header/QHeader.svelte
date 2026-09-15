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

  const headerContext = headerCtx.get();
  // #endregion: --- Reactive variables

  // #region:    --- Props
  let {
    elevated = false,
    inset = false,
    reveal = false,
    revealOffset = 250,
    height = 64,
    bordered = false,
    children,
    ...props
  }: QHeaderProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const revealObserver = useRevealScrollObserver("header", uid, () => reveal && !!headerContext);
  const revealScroll = $derived(revealObserver.scroll);
  const isCollapsed = $derived(reveal && isScrollingDown && scrollPosition > height + revealOffset);

  const leftOffset = $derived(headerContext?.view.charAt(0) === "l");

  const rightOffset = $derived(headerContext?.view.charAt(2) === "r");
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    const position = revealScroll?.position ?? 0;

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

    headerCtx.updateEntries({
      height,
      collapsed: isCollapsed,
      ready: true,
    });
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => () => {
    headerCtx.updateEntries({
      height: 0,
      collapsed: false,
      ready: false,
    });
  });
  // #endregion: --- Lifecycle

  Q.classes("q-header", {
    bemClasses: {
      [uid]: true,
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

<header
  bind:this={headerEl}
  {...props}
  class="q-header"
  style:--header-height="{height}px"
  data-quaff
>
  {@render children?.()}
</header>
