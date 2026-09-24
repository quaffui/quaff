<!--
@component
Navigation bars provide access to three to five primary destinations from the bottom of a layout.
-->

<script lang="ts">
  import { onMount } from "svelte";
  import { navigationCtx } from "$internal/navigationContext";

  import { useColor } from "$composables";
  import { navbarCtx } from "../layout/QLayout.svelte";
  import type { QNavbarProps } from "./props";

  navigationCtx.set("bar");

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
      navbarCtx.updateEntries(layoutContext, {
        height: navbarEl?.getBoundingClientRect().height ?? 0,
        ready: true,
      });
    };
    const resizeObserver = new ResizeObserver(updateLayout);

    updateLayout();
    resizeObserver.observe(navbarEl);

    return () => {
      resizeObserver.disconnect();
      navbarCtx.updateEntries(layoutContext, { height: 0, ready: false });
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
