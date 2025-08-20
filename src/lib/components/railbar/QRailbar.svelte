<script lang="ts">
  import { onMount } from "svelte";
  import { leftRailbarCtx, rightRailbarCtx } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  // #region:    --- Props
  let { width = 88, side = "left", bordered = false, children, ...props }: QRailbarProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let railbarEl: HTMLElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const railbarCtxToUse = $derived(side === "left" ? leftRailbarCtx : rightRailbarCtx);
  const railbarCtx = $derived(railbarCtxToUse.get());

  const offsetTop = $derived.by(() => {
    const charPos = side === "left" ? 0 : 2;
    return railbarCtx?.view.charAt(charPos) === "h";
  });
  const offsetBottom = $derived.by(() => {
    const charPos = side === "left" ? 8 : 10;
    return railbarCtx?.view.charAt(charPos) === "f";
  });

  const railbarWidthStyle = $derived(`--${side}-railbar-width: ${width}px`);

  const style = $derived(`${railbarWidthStyle};${props.style ?? ""}`);
  // #endregion: --- Derived values

  // #region:    --- Lifecycle
  onMount(() => {
    railbarCtxToUse.updateEntries({
      width,
      takesSpace: railbarEl.style.display !== "none" || false,
      ready: true,
    });

    setTimeout(() => {
      railbarEl.style.transition = "top 0.3s, bottom 0.3s, transform 0.3s";
    }, 100);

    return () => {
      railbarCtxToUse.updateEntries({
        width: 0,
        takesSpace: false,
        ready: false,
      });
    };
  });
  // #endregion: --- Lifecycle

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
    },
    classes: [props.class],
  });
</script>

<nav bind:this={railbarEl} {...props} class="q-railbar" {style} data-quaff>
  {@render children?.()}
</nav>
