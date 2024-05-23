<script lang="ts">
  import { navigating } from "$app/stores";
  import { useSize } from "$lib/composables";
  import { clickOutside } from "$lib/helpers";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QDrawerProps } from "./props";
  import QContext from "$lib/classes/QContext.svelte";

  let {
    value = $bindable(false),
    side = "left",
    width = 300,
    bordered = false,
    overlay = false,
    persistent = false,
    children,
    ...props
  }: QDrawerProps = $props();

  const ctx = QContext.get<LayoutContext>("layout");

  const drawerType = $derived(side === "left" ? "drawerLeft" : "drawerRight");

  const drawerCtx = $derived(ctx?.value?.[drawerType]);

  const canHideOnClickOutside = $derived((value && !persistent) || overlay);

  const hideOnRouteChange = $derived(!persistent || overlay);

  export const show = (e?: MouseEvent) => {
    if (!value) {
      value = true;
      e?.stopPropagation();
    }
  };

  export const hide = () => {
    if (value) {
      value = false;
    }
  };

  export const toggle = (e?: MouseEvent) => {
    value = !value;
    e?.stopPropagation();
  };

  $effect(() => {
    // eslint-disable-next-line svelte/valid-compile
    if ($navigating && hideOnRouteChange) {
      hide();
    }
  });

  const shouldHaveRadius = (pos: "top" | "bottom") => {
    const appBarEl = pos === "top" ? ctx?.value?.header : ctx?.value?.footer;

    // This is an overlay, or there is no header/footer, or there is an offset top/bottom
    return overlay || !appBarEl?.display || drawerCtx?.offset[pos];
  };

  Q.classes("q-drawer", {
    bemClasses: {
      [side]: true,
      active: value,
      overlay,
      bordered,
      "offset-top": drawerCtx?.offset.top,
      "offset-bottom": drawerCtx?.offset.bottom,
      fixed: drawerCtx?.fixed,
      "top-left-radius": side === "right" && shouldHaveRadius("top"),
      "bottom-left-radius": side === "right" && shouldHaveRadius("bottom"),
      "top-right-radius": side === "left" && shouldHaveRadius("top"),
      "bottom-right-radius": side === "left" && shouldHaveRadius("bottom"),
      above: (["top", "bottom"] as const).some((pos) => !drawerCtx?.offset[pos] && overlay),
    },
    classes: [props.class],
  });

  const widthStyle = $derived(!ctx ? useSize(width).style : null);

  const drawerWidthStyle = $derived(
    widthStyle === null ? "" : `--${side}-drawer-width: ${widthStyle};`
  );

  const style = $derived(`${drawerWidthStyle}${props.style ?? ""}`);
</script>

<div
  {...props}
  use:clickOutside={() => canHideOnClickOutside && hide()}
  class="q-drawer"
  {...Q.classes}
  {style}
>
  {@render children?.()}
</div>
