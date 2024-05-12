<script lang="ts">
  import { navigating } from "$app/stores";
  import { useSize } from "$lib/composables";
  import { clickOutside } from "$lib/helpers";
  import { createClasses, createStyles } from "$lib/utils";
  import { getContext } from "svelte";
  import { derived } from "svelte/store";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QDrawerProps } from "./props";

  export let value: QDrawerProps["value"] = false,
    side: QDrawerProps["side"] = "left",
    width: QDrawerProps["width"] = 300,
    bordered: QDrawerProps["bordered"] = false,
    overlay: QDrawerProps["overlay"] = false,
    persistent: QDrawerProps["persistent"] = false,
    userClasses: QDrawerProps["userClasses"] = undefined,
    userStyles: QDrawerProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: canHideOnClickOutside = (value === true && persistent === false) || overlay === true;

  $: widthStyle = !$ctx && useSize(width).style;

  $: hideOnRouteChange = persistent !== true || overlay === true;

  export const show = (e?: MouseEvent) => {
    if (value !== true) {
      value = true;
      e && e.stopPropagation();
    }
  };

  export const hide = () => {
    if (value === true) {
      value = false;
    }
  };

  export const toggle = (e?: MouseEvent) => {
    value = !value;
    e && e.stopPropagation();
  };

  // svelte-ignore global_reference_invalid
  $: if ($navigating && hideOnRouteChange) {
    hide();
  }

  let ctx = getContext<LayoutContext | undefined>("layout");

  let drawerType: "drawerLeft" | "drawerRight";
  $: drawerType = side === "left" ? "drawerLeft" : "drawerRight";

  $: classes = createClasses(
    [
      side,
      value && "active",
      overlay && "overlay",
      bordered && "bordered",

      $ctx && $ctx[drawerType].offset.top && "offset-top",
      $ctx && $ctx[drawerType].offset.bottom && "offset-bottom",
      $ctx && $ctx[drawerType].fixed && "fixed",

      $borderRadiusClasses,
      $zIndexClass,
    ],
    {
      component: "q-drawer",
      userClasses,
    }
  );

  $: style = createStyles(
    {
      [side === "left" ? "--leftDrawerWidth" : "--rightDrawerWidth"]: widthStyle,
    },
    userStyles
  );

  $: borderRadiusClasses =
    ctx && // No border radius if this isn't a layout drawer
    derived(ctx, (context) => {
      const borderSide = side === "left" ? "right" : "left";

      const shouldHaveRadius = (pos: "top" | "bottom") => {
        let appBarEl = pos === "top" ? context["header"] : context["footer"];

        // This is an overlay, or there is no header/footer, or there is an offset top/bottom
        return overlay || !appBarEl?.display || context[drawerType].offset[pos];
      };

      return createClasses(
        [
          shouldHaveRadius("top") && `top-${borderSide}-radius`,
          shouldHaveRadius("bottom") && `bottom-${borderSide}-radius`,
        ],
        {
          component: "q-drawer",
        }
      );
    });

  $: zIndexClass =
    ctx &&
    derived(ctx, (context) => {
      const drawer = side === "left" ? context.drawerLeft : context.drawerRight;

      let pos: keyof typeof drawer.offset;
      for (pos of ["top", "bottom"] as const) {
        if (!drawer.offset[pos] && overlay) {
          drawer.overlay = true;
          return "above";
        }
      }
    });
</script>

<div
  use:clickOutside={() => canHideOnClickOutside && hide()}
  class={classes}
  {style}
  {...$$restProps}
>
  <slot />
</div>
