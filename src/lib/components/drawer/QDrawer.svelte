<script lang="ts">
  import { getContext, onDestroy, untrack } from "svelte";
  import { navigating } from "$app/stores";
  import { useSize } from "$lib/composables";
  import { clickOutside } from "$lib/helpers";
  import QContext from "$lib/classes/QContext.svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import type { DrawerContext, LayoutContext } from "../layout/QLayout.svelte";
  import type { QDrawerProps } from "./props";

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

  const drawerContext = QContext.get<DrawerContext>(`QDrawer-${side}`);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  const ctx = QContext.get<LayoutContext>("layout");

  const drawerType = $derived(side === "left" ? "drawerLeft" : "drawerRight");

  const drawerCtx = $derived(ctx?.value?.[drawerType]);

  const canHideOnClickOutside = $derived((value && !persistent) || overlay);

  const hideOnRouteChange = $derived(!persistent || overlay);

  const offsetTop = $derived.by(() => {
    const charPos = side === "left" ? 0 : 2;
    return layoutView?.value.charAt(charPos) === "h";
  });
  const offsetBottom = $derived.by(() => {
    const charPos = side === "left" ? 8 : 10;
    return layoutView?.value.charAt(charPos) === "f";
  });

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
    if ($navigating && hideOnRouteChange) {
      hide();
    }
  });

  onDestroy(() => {
    drawerContext?.updateEntries({
      width: 0,
      takesSpace: false,
    });
  });

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [value, overlay, width];

    // TODO: Try to make it work without console.debug
    // writing untrack(() => drawerContext)?.updateEntries(...) doesn't work (infinite $effect loop)
    untrack(() =>
      drawerContext?.updateEntries({
        takesSpace: !!value && !overlay,
        width,
      })
    );
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
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
      fixed: drawerCtx?.fixed,
      "top-left-radius": side === "right" && shouldHaveRadius("top"),
      "bottom-left-radius": side === "right" && shouldHaveRadius("bottom"),
      "top-right-radius": side === "left" && shouldHaveRadius("top"),
      "bottom-right-radius": side === "left" && shouldHaveRadius("bottom"),
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
