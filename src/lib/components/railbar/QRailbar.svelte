<script lang="ts">
  import { useColor } from "$composables";
  import { leftRailbarCtx, rightRailbarCtx } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  // #region:    --- Props
  let {
    activeColor = "secondary-container",
    width = 80,
    side = "left",
    bordered = false,
    children,
    ...props
  }: QRailbarProps = $props();
  // #endregion: --- Props

  let railbarEl = $state<HTMLElement>();
  const leftContext = leftRailbarCtx.get();
  const rightContext = rightRailbarCtx.get();

  // #region:    --- Derived values
  const railbarCtx = $derived(side === "left" ? leftContext : rightContext);
  const hasTopOffset = $derived(railbarCtx?.view.charAt(side === "left" ? 0 : 2) === "h");
  const hasBottomOffset = $derived(railbarCtx?.view.charAt(side === "left" ? 8 : 10) === "f");
  const parsedActiveColor = $derived(
    activeColor === "secondary-container" ? undefined : useColor(activeColor)
  );

  const style = $derived(`--${side}-railbar-width: ${width}px;${props.style ?? ""}`);
  // #endregion: --- Derived values

  $effect(() => {
    // Keep this side's context so cleanup resets it after a side change.
    const context = railbarCtx;
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

      Object.assign(context, { width: measuredWidth, takesSpace: measuredWidth > 0, ready: true });
    };
    const observer = new ResizeObserver(updateLayout);
    updateLayout();
    observer.observe(element);

    return () => {
      observer.disconnect();
      Object.assign(context, { width: 0, takesSpace: false, ready: false });
    };
  });

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
      "offset-top": hasTopOffset,
      "offset-bottom": hasBottomOffset,
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
