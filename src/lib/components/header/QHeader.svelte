<script lang="ts">
  import { onMount } from "svelte";
  import { QScrollObserver } from "$lib";
  import { headerCtx } from "../layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";

  // #region:    --- Non-reactive variables
  const uid = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let headerEl = $state<HTMLElement>();

  const headerContext = headerCtx.assertGet("QHeader should be used inside QLayout");
  // #endregion: --- Reactive variables

  // #region:    --- Props
  let {
    elevated = false,
    inset = false,
    reveal = false,
    revealOffset = 250,
    height = 64,
    bordered = false, // Added bordered here for explicitness, though it's in props
    children,
    ...props
  }: QHeaderProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const scroll = $derived(
    reveal ? new QScrollObserver(`.q-header--${uid} ~ .q-layout__content`) : undefined
  );

  const offset = $derived(scroll ? scroll.position - height : undefined);

  // Collapse the header `${reavealOffset}px` below the top of layout content when scrolling down
  const collapsed = $derived(reveal && scroll?.direction === "down" && offset! - revealOffset > 0);

  const leftOffset = $derived(headerContext.view.charAt(0) === "l");

  const rightOffset = $derived(headerContext.view.charAt(2) === "r");
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    headerCtx.updateEntries({
      height,
      collapsed,
      ready: true,
    });
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => {
    if (headerContext) {
      setTimeout(() => {
        if (headerEl) {
          headerEl.style.transition = "all 0.3s";
        }
      }, 100);
    }

    return () => {
      if (headerEl) {
        headerEl.style.transition = "none";
      }

      headerCtx.updateEntries({
        height: 0,
        collapsed: false,
        ready: false,
      });
    };
  });
  // #endregion: --- Lifecycle

  Q.classes("q-header", {
    bemClasses: {
      [uid]: true,
      elevated,
      bordered,
      collapsed,
      "offset-left": leftOffset,
      "offset-right": rightOffset,
      inset,
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
