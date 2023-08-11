<script lang="ts">
  import { getContext } from "svelte";
  import type { QRailbarProps } from "./props";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { useSize } from "$lib/composables/use-size";
  import { derived } from "svelte/store";

  export let width: QRailbarProps["width"] = 88,
    side: QRailbarProps["side"] = "left",
    bordered: QRailbarProps["bordered"] = false,
    userClasses: QRailbarProps["userClasses"] = undefined,
    userStyles: QRailbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  let drawerType: "drawerLeft" | "drawerRight";
  $: drawerType = side === "left" ? "drawerLeft" : "drawerRight";

  $: classes = createClasses(
    [
      side,
      bordered && "bordered",

      $ctx && $ctx[drawerType].offset.top && "offset-top",
      $ctx && $ctx[drawerType].offset.bottom && "offset-bottom",
      $ctx && $ctx[drawerType].fixed && "fixed",

      $borderRadiusClasses,
      $zIndexClass,
    ],
    {
      component: "q-railbar",
      userClasses,
    }
  );

  $: widthStyle = !$ctx && useSize(width).style;

  $: style = createStyles(
    {
      [`--${side}-railbar-width`]: widthStyle,
    },
    userStyles
  );

  $: borderRadiusClasses =
    ctx && // No border radius if this isn't a layout railbar
    derived(ctx, (context) => {
      const borderSide = side === "left" ? "right" : "left";

      const shouldHaveRadius = (pos: "top" | "bottom") => {
        let appBarEl = pos === "top" ? context["header"] : context["footer"];

        // There is a drawer => no border-radius
        if (context[drawerType].drawer) {
          return false;
        }

        // There is no header/footer or there is an offset top/bottom
        return !appBarEl?.display || context[drawerType].offset[pos];
      };

      return createClasses(
        [
          shouldHaveRadius("top") && `top-${borderSide}-radius`,
          shouldHaveRadius("bottom") && `bottom-${borderSide}-radius`,
        ],
        {
          component: "q-railbar",
        }
      );
    });

  $: zIndexClass =
    ctx &&
    derived(ctx, (context) => {
      let drawer = side === "left" ? context.drawerLeft : context.drawerRight;

      let pos: keyof typeof drawer.offset;
      for (pos of ["top", "bottom"] as const) {
        if (!drawer.offset[pos] && drawer.overlay) {
          return "above";
        }
      }
    });
</script>

<nav class={classes} {style}>
  <slot />
</nav>
