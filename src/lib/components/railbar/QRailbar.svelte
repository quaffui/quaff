<script lang="ts">
  import { getContext, onDestroy, onMount, untrack } from "svelte";
  import { QContext } from "$lib/classes/QContext.svelte";
  import { QLayoutCtxName } from "$utils";
  import type { QLayoutProps } from "$components/layout/props";
  import type { DrawerContext } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  let { width = 88, side = "left", bordered = false, children, ...props }: QRailbarProps = $props();

  const railbarCtx = QContext.get<DrawerContext>(QLayoutCtxName.railbar[side]);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>(QLayoutCtxName.view);

  let railbarEl: HTMLElement;

  onMount(() => {
    if (railbarCtx) {
      setTimeout(() => {
        railbarEl.style.transition = "top 0.3s, bottom 0.3s, transform 0.3s";
      }, 100);
    }
  });

  onDestroy(() => {
    untrack(() => railbarCtx)?.updateEntries({
      width: 0,
      takesSpace: false,
      ready: false,
    });
  });

  $effect.pre(() => {
    untrack(() => railbarCtx)?.updateEntries({
      width,
      takesSpace: railbarEl?.style.display !== "none" || false,
      ready: true,
    });
  });

  const offsetTop = $derived.by(() => {
    const charPos = side === "left" ? 0 : 2;
    return layoutView?.value.charAt(charPos) === "h";
  });
  const offsetBottom = $derived.by(() => {
    const charPos = side === "left" ? 8 : 10;
    return layoutView?.value.charAt(charPos) === "f";
  });

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
    },
    classes: [props.class],
  });

  const railbarWidthStyle = $derived(`--${side}-railbar-width: ${width}px`);

  const style = $derived(`${railbarWidthStyle};${props.style ?? ""}`);
</script>

<nav bind:this={railbarEl} {...props} class="q-railbar" {style} data-quaff>
  {@render children?.()}
</nav>
