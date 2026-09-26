<!--
@component
Railbars are used to provide navigation between different sections or views within an application.
-->

<script lang="ts">
  import { navigationCtx } from "$internal/navigationContext";

  import { useColor } from "$composables";
  import {
    startRailbarCtx,
    endRailbarCtx,
    leftRailbarCtx,
    rightRailbarCtx,
  } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  navigationCtx.set("bar");

  // #region:    --- Props
  let {
    activeColor = "secondary-container",
    width = 80,
    side = "start",
    bordered = false,
    children,
    ...props
  }: QRailbarProps = $props();
  // #endregion: --- Props

  let railbarEl = $state<HTMLElement>();
  const contexts = {
    start: { api: startRailbarCtx, context: startRailbarCtx.get() },
    end: { api: endRailbarCtx, context: endRailbarCtx.get() },
    left: { api: leftRailbarCtx, context: leftRailbarCtx.get() },
    right: { api: rightRailbarCtx, context: rightRailbarCtx.get() },
  };

  // #region:    --- Derived values
  const parsedActiveColor = $derived(
    activeColor === "secondary-container" ? undefined : useColor(activeColor)
  );

  const style = $derived(`--q-railbar-width: ${width}px;${props.style ?? ""}`);
  // #endregion: --- Derived values

  $effect(() => {
    // Keep this side's context so cleanup resets it after a side change.
    const { api: contextApi, context } = contexts[side];
    const element = railbarEl;
    const configuredWidth = width;

    if (!context || !element) {
      return;
    }

    const updateLayout = () => {
      const style = getComputedStyle(element);
      let measuredWidth = element.offsetWidth;

      if (!measuredWidth && style.display !== "none") {
        measuredWidth = style.width.endsWith("px") ? parseFloat(style.width) : configuredWidth;
      }

      contextApi.updateEntries(context, {
        width: measuredWidth,
        takesSpace: measuredWidth > 0,
        ready: true,
      });
    };
    const observer = new ResizeObserver(updateLayout);
    updateLayout();
    observer.observe(element);

    return () => {
      observer.disconnect();
      contextApi.updateEntries(context, { width: 0, takesSpace: false, ready: false });
    };
  });

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
    },
    classes: [props.class],
  });
</script>

<nav
  bind:this={railbarEl}
  {...props}
  class="q-railbar"
  {style}
  style:--q-nav-item-active-indicator-color={parsedActiveColor}
  data-quaff
>
  {@render children?.()}
</nav>
