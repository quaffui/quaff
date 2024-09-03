<script context="module" lang="ts">
  import { setContext, untrack } from "svelte";
  import QContext from "$lib/classes/QContext.svelte";
  import { isNumeric } from "$lib/utils/number";
  import ContextReseter from "../private/ContextReseter.svelte";
  import type { QLayoutProps } from "./props";

  export interface DrawerContextLegacy {
    offset: {
      top: boolean;
      bottom: boolean;
    };
    fixed: boolean;
    railbar: boolean;
    drawer: boolean;
    overlay: boolean;
  }

  export interface AppbarContext {
    height: number;
    collapsed: boolean;
  }

  export interface DrawerContext {
    width: number;
    takesSpace: boolean;
  }

  export interface AppbarContextLegacy {
    display: boolean;
    fixed: boolean;
  }

  export type LayoutContext = {
    header?: AppbarContextLegacy;
    footer?: AppbarContextLegacy;
    drawerLeft: DrawerContextLegacy;
    drawerRight: DrawerContextLegacy;
  };
</script>

<script lang="ts">
  let {
    view = "hhh lpr fff",
    headerHeight = "64px",
    footerHeight = "80px",
    leftDrawerWidth = "300px",
    rightDrawerWidth = "300px",
    leftRailbarWidth = "88px",
    rightRailbarWidth = "88px",
    content,
    railbarLeft,
    railbarRight,
    drawerLeft,
    drawerRight,
    header,
    footer,
    onscroll,
    onresize,
    ...props
  }: QLayoutProps = $props();

  Q.classes("q-layout", {
    classes: [props.class],
  });

  setContext("view", {
    get value() {
      return view;
    },
  });

  const headerCtx = new QContext<AppbarContext>("QHeader", {
    height: 64,
    collapsed: false,
  });
  const topOffset = $derived(!header || headerCtx.value.collapsed ? 0 : headerCtx.value.height);

  const footerCtx = new QContext<AppbarContext>("QFooter", {
    height: 80,
    collapsed: false,
  });
  const bottomOffset = $derived(!footer || footerCtx.value.collapsed ? 0 : footerCtx.value.height);

  const leftRailbarCtx = new QContext<DrawerContext>("QRailbar-left", {
    width: 80,
    takesSpace: false,
  });
  const rightRailbarCtx = new QContext<DrawerContext>("QRailbar-right", {
    width: 80,
    takesSpace: false,
  });

  const leftDrawerCtx = new QContext<DrawerContext>("QDrawer-left", {
    width: 360,
    takesSpace: false,
  });
  const rightDrawerCtx = new QContext<DrawerContext>("QDrawer-right", {
    width: 360,
    takesSpace: false,
  });

  const leftOffset = $derived(handleDrawerCtx(leftRailbarCtx) + handleDrawerCtx(leftDrawerCtx));
  const rightOffset = $derived(handleDrawerCtx(rightRailbarCtx) + handleDrawerCtx(rightDrawerCtx));

  function handleDrawerCtx(ctx: QContext<DrawerContext>) {
    return ctx.value.takesSpace ? ctx.value.width : 0;
  }
</script>

<div
  {...props}
  class="q-layout"
  {...Q.classes}
  style:--left-railbar-width="{leftRailbarCtx.value.width}px"
  style:--right-railbar-width="{rightDrawerCtx.value.width}px"
  style:--offset-top="{topOffset}px"
  style:--offset-right="{rightOffset}px"
  style:--offset-bottom="{bottomOffset}px"
  style:--offset-left="{leftOffset}px"
  {onscroll}
  {onresize}
>
  {@render railbarLeft?.()}
  {@render railbarRight?.()}
  {@render drawerLeft?.()}
  {@render drawerRight?.()}
  {@render header?.()}
  {@render footer?.()}

  <ContextReseter keys="layout">
    {#snippet children()}
      {@render content?.()}
    {/snippet}
  </ContextReseter>
</div>
