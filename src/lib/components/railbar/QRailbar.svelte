<script lang="ts">
  import { getContext, onDestroy, untrack } from "svelte";
  import QContext from "$lib/classes/QContext.svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import "./QRailbar.scss";
  import type { DrawerContext } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  let { width = 88, side = "left", bordered = false, children, ...props }: QRailbarProps = $props();

  const railbarCtx = QContext.get<DrawerContext>(`QRailbar-${side}`);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  let railbarEl = $state<HTMLElement>();

  onDestroy(() => {
    untrack(() => railbarCtx)?.updateEntries({
      width: 0,
      takesSpace: false,
    });
  });

  $effect.pre(() => {
    untrack(() => railbarCtx)?.updateEntries({
      width,
      takesSpace: railbarEl?.style.display !== "none" || false,
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

<nav bind:this={railbarEl} {...props} class="q-railbar" {...Q.classes} {style}>
  {@render children?.()}
</nav>
