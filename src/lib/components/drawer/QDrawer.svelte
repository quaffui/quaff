<script lang="ts">
  import { getContext, onDestroy, untrack } from "svelte";
  import { navigating } from "$app/state";
  import { useSize } from "$lib/composables";
  import { QContext } from "$lib/classes/QContext.svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import type { DrawerContext } from "../layout/QLayout.svelte";
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

  let drawerEl: HTMLDivElement;

  const drawerContext = QContext.get<DrawerContext>(`QDrawer-${side}`);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

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
    if (navigating.type && hideOnRouteChange) {
      hide();
    }
  });

  $effect(() => {
    if (value) {
      setTimeout(() => {
        window.addEventListener("click", tryClose);
      }, 150);
    } else {
      window.removeEventListener("click", tryClose);
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

    untrack(() =>
      drawerContext?.updateEntries({
        takesSpace: !!value && !overlay,
        width,
      })
    );
  });

  Q.classes("q-drawer", {
    bemClasses: {
      [side]: true,
      active: value,
      overlay,
      bordered,
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
    },
    classes: [props.class],
  });

  const widthStyle = $derived(!drawerContext ? useSize(width).style : null);

  const drawerWidthStyle = $derived(
    widthStyle === null ? "" : `--${side}-drawer-width: ${widthStyle};`
  );

  const style = $derived(`${drawerWidthStyle}${props.style ?? ""}`);

  function tryClose(e: MouseEvent) {
    const isTargetDrawer = e.target === drawerEl;
    const isTargetInsideDrawer = drawerEl.contains(e.target as Node);

    if (canHideOnClickOutside && !isTargetDrawer && !isTargetInsideDrawer) {
      e.stopPropagation();
      hide();
    }
  }
</script>

<div bind:this={drawerEl} {...props} class="q-drawer" {style} data-quaff>
  {@render children?.()}
</div>
