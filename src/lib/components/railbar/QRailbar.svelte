<script lang="ts">
  import { useSize } from "$lib/composables";
  import QContext from "$lib/classes/QContext.svelte";
  import type { DrawerContext, LayoutContext } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";
  import { getContext, untrack } from "svelte";
  import type { QLayoutProps } from "$components/layout/props";

  let { width = 88, side = "left", bordered = false, children, ...props }: QRailbarProps = $props();

  const railbarCtx = QContext.get<DrawerContext>(`QRailbar-${side}`);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  const ctx = QContext.get<LayoutContext>("layout");

  let railbarEl = $state<HTMLElement>();

  const drawerType = $derived(side === "left" ? "drawerLeft" : "drawerRight");

  const drawerCtx = $derived(ctx?.value?.[drawerType]);

  const shouldHaveRadius = (pos: "top" | "bottom") => {
    const appBarEl = pos === "top" ? ctx?.value?.header : ctx?.value?.footer;
    // There is a drawer => no border-radius
    if (drawerCtx?.drawer) {
      return false;
    }

    // There is no header/footer or there is an offset top/bottom
    return !appBarEl?.display || drawerCtx?.offset[pos];
  };

  $effect(() => {
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
    return layoutView?.value.charAt(charPos) === "h";
  });

  $inspect({ side, offsetTop });

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
      fixed: drawerCtx?.fixed,
      "top-left-radius": side === "left" && shouldHaveRadius("top"),
      "bottom-left-radius": side === "left" && shouldHaveRadius("bottom"),
      "top-right-radius": side === "right" && shouldHaveRadius("top"),
      "bottom-right-radius": side === "right" && shouldHaveRadius("bottom"),
      above: (["top", "bottom"] as const).some(
        (pos) => !drawerCtx?.offset[pos] && drawerCtx?.overlay
      ),
    },
    classes: [props.class],
  });

  const widthStyle = $derived(!ctx ? useSize(width).style : null);

  const railbarWidthStyle = $derived(
    widthStyle === null ? "" : `--${side}-railbar-width: ${widthStyle};`
  );

  const style = $derived(`${railbarWidthStyle}${props.style ?? ""}`);
</script>

<nav bind:this={railbarEl} {...props} class="q-railbar" {...Q.classes} {style}>
  {@render children?.()}
</nav>
