<script lang="ts">
  import { onMount } from "svelte";
  import { useColor } from "$composables";
  import { navbarCtx } from "../layout/QLayout.svelte";
  import type { QNavbarProps } from "./props";

  // #region:    --- Props
  let {
    activeColor = "secondary-container",
    height = 64,
    bordered = false,
    horizontal = false,
    children,
    ...props
  }: QNavbarProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let navbarEl = $state<HTMLElement>();

  const layoutContext = navbarCtx.get();
  const parsedActiveColor = $derived(
    activeColor === "secondary-container" ? undefined : useColor(activeColor)
  );
  // #endregion: --- Reactive variables

  // #region:    --- Lifecycle
  onMount(() => {
    if (!layoutContext || !navbarEl) {
      return;
    }

    const updateLayout = () => {
      layoutContext.height = navbarEl?.getBoundingClientRect().height ?? 0;
      layoutContext.ready = true;
    };
    const resizeObserver = new ResizeObserver(updateLayout);

    updateLayout();
    resizeObserver.observe(navbarEl);

    return () => {
      resizeObserver.disconnect();
      layoutContext.height = 0;
      layoutContext.ready = false;
    };
  });
  // #endregion: --- Lifecycle

  Q.classes("q-navbar", {
    bemClasses: {
      bordered,
      horizontal,
    },
    classes: [props.class],
  });
</script>

<nav
  bind:this={navbarEl}
  {...props}
  class="q-navbar"
  style:--q-navbar-min-height="{height}px"
  style:--q-nav-item-active-indicator-color={parsedActiveColor}
  aria-label={props["aria-label"] ?? "Primary navigation"}
  data-quaff
>
  {@render children?.()}
</nav>
