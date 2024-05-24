<script lang="ts">
  import { useSize } from "$lib/composables";
  import QContext from "$lib/classes/QContext.svelte";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  let { width = 88, side = "left", bordered = false, children, ...props }: QRailbarProps = $props();

  const ctx = QContext.get<LayoutContext>("layout");

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

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      bordered,
      "offset-top": drawerCtx?.offset.top,
      "offset-bottom": drawerCtx?.offset.bottom,
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

<nav {...props} class="q-railbar" {...Q.classes} {style}>
  {@render children?.()}
</nav>
