<script module lang="ts">
  import { onMount } from "svelte";
  import { QContext } from "$lib/utils";
  import { ContextReseter } from "$private";
  import type { QLayoutProps } from "./props";

  interface AppbarContext {
    readonly view: string;
    height: number;
    collapsed: boolean;
    ready: boolean;
  }

  interface DrawerContext {
    readonly view: string;
    width: number;
    takesSpace: boolean;
    ready: boolean;
  }

  export const headerCtx = QContext<AppbarContext>("QHeader");
  export const footerCtx = QContext<AppbarContext>("QFooter");

  export const leftRailbarCtx = QContext<DrawerContext>("QRailbarLeft");
  export const rightRailbarCtx = QContext<DrawerContext>("QRailbarRight");
  export const leftDrawerCtx = QContext<DrawerContext>("QDrawerLeft");
  export const rightDrawerCtx = QContext<DrawerContext>("QDrawerRight");
</script>

<script lang="ts">
  // #region:    --- Props
  let {
    view = "hhh lpr fff",
    content,
    railbarLeft,
    railbarRight,
    drawerLeft,
    drawerRight,
    header,
    footer,
    onscroll,
    onresize,
    children,
    ...props
  }: QLayoutProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let layoutEl = $state<HTMLDivElement>();
  let contentEl = $state<HTMLDivElement>();

  const headerInfo = $state({
    height: 0,
    collapsed: false,
    ready: false,
  });
  const footerInfo = $state({
    height: 0,
    collapsed: false,
    ready: false,
  });
  const leftRailbarInfo = $state({
    width: 88,
    takesSpace: false,
    ready: false,
  });
  const rightRailbarInfo = $state({
    width: 88,
    takesSpace: false,
    ready: false,
  });
  const leftDrawerInfo = $state({
    width: 300,
    takesSpace: false,
    ready: false,
  });
  const rightDrawerInfo = $state({
    width: 300,
    takesSpace: false,
    ready: false,
  });
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const topOffset = $derived(!header || headerInfo.collapsed ? 0 : headerInfo.height);
  const bottomOffset = $derived(!footer || footerInfo.collapsed ? 0 : footerInfo.height);
  const leftOffset = $derived(handleDrawerCtx(leftRailbarInfo) + handleDrawerCtx(leftDrawerInfo));
  const rightOffset = $derived(
    handleDrawerCtx(rightRailbarInfo) + handleDrawerCtx(rightDrawerInfo)
  );

  const contentMargin = $derived(
    `${header ? topOffset : 0}px ${rightOffset}px ${footer ? bottomOffset : 0}px ${leftOffset}px`
  );

  const isReady = $derived(
    (!header || headerInfo.ready || (layoutEl && !layoutEl.querySelector(".q-header"))) &&
      (!footer || footerInfo.ready || (layoutEl && !layoutEl.querySelector(".q-footer"))) &&
      (!railbarLeft ||
        leftRailbarInfo.ready ||
        (layoutEl && !layoutEl.querySelector(":scope > .q-railbar--left"))) &&
      (!railbarRight ||
        rightRailbarInfo.ready ||
        (layoutEl && !layoutEl.querySelector(":scope > .q-railbar--right"))) &&
      (!drawerLeft ||
        leftDrawerInfo.ready ||
        (layoutEl && !layoutEl.querySelector(":scope > .q-drawer--left"))) &&
      (!drawerRight ||
        rightDrawerInfo.ready ||
        (layoutEl && !layoutEl.querySelector(":scope > .q-drawer--right")))
  );
  // #endregion: --- Derived values

  // #region:    --- Context
  headerCtx.set({
    view,
    height: headerInfo.height,
    collapsed: headerInfo.collapsed,
    ready: headerInfo.ready,
  });
  footerCtx.set({
    view,
    height: footerInfo.height,
    collapsed: footerInfo.collapsed,
    ready: footerInfo.ready,
  });

  leftRailbarCtx.set({
    view,
    width: leftRailbarInfo.width,
    takesSpace: leftRailbarInfo.takesSpace,
    ready: leftRailbarInfo.ready,
  });
  rightRailbarCtx.set({
    view,
    width: rightRailbarInfo.width,
    takesSpace: rightRailbarInfo.takesSpace,
    ready: rightRailbarInfo.ready,
  });

  leftDrawerCtx.set({
    view,
    width: leftDrawerInfo.width,
    takesSpace: leftDrawerInfo.takesSpace,
    ready: leftDrawerInfo.ready,
  });
  rightDrawerCtx.set({
    view,
    width: rightDrawerInfo.width,
    takesSpace: rightDrawerInfo.takesSpace,
    ready: rightDrawerInfo.ready,
  });
  // #endregion: --- Context

  // #region:    --- Lifecycle
  onMount(() => {
    setTimeout(() => {
      if (contentEl) {
        contentEl.style.transition = "margin 0.3s";
      }
    }, 100);
  });
  // #endregion: --- Lifecycle

  // #region:    --- Functions
  function handleDrawerCtx(info: Omit<DrawerContext, "view">) {
    return info.takesSpace ? info.width : 0;
  }
  // #endregion: --- Functions

  Q.classes("q-layout", {
    bemClasses: {
      ready: isReady,
    },
    classes: [props.class],
  });
</script>

<div
  bind:this={layoutEl}
  {...props}
  class="q-layout"
  style:--left-drawer-width={`${drawerLeft ? leftDrawerInfo.width : 0}px`}
  style:--right-drawer-width={`${drawerRight ? rightDrawerInfo.width : 0}px`}
  style:--left-railbar-width={`${railbarLeft ? leftRailbarInfo.width : 0}px`}
  style:--right-railbar-width={`${railbarRight ? rightRailbarInfo.width : 0}px`}
  style:--offset-top={`${topOffset}px`}
  style:--offset-right={`${rightOffset}px`}
  style:--offset-bottom={`${bottomOffset}px`}
  style:--offset-left={`${leftOffset}px`}
  {onscroll}
  {onresize}
>
  {@render railbarLeft?.()}
  {@render railbarRight?.()}
  {@render drawerLeft?.()}
  {@render drawerRight?.()}
  {@render header?.()}
  {@render footer?.()}

  <ContextReseter
    keys={[
      headerCtx.symbol,
      footerCtx.symbol,
      leftRailbarCtx.symbol,
      rightRailbarCtx.symbol,
      leftDrawerCtx.symbol,
      rightDrawerCtx.symbol,
    ]}
  >
    <div bind:this={contentEl} class="q-layout__content" style:margin={contentMargin}>
      {#if content}
        {@render content()}
      {:else}
        {@render children?.()}
      {/if}
    </div>
  </ContextReseter>
</div>
