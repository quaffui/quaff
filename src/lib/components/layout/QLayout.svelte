<!--
@component
The QLayout component is designed to be the skeleton of the entire page, with navigational elements such as a header, railbars, drawers, a navbar, and a footer. This component is not mandatory but it helps structure the page.
-->

<script module lang="ts">
  import { onMount } from "svelte";
  import { navigationCtx } from "$internal/navigationContext";
  import ContextResetter from "$internal/ContextResetter.svelte";
  import { QContext } from "$utils/context";
  import type { QLayoutProps } from "./props";

  interface AppbarContext {
    readonly view: string;
    height: number;
    collapsed: boolean;
    ready: boolean;
    ownerId?: string;
  }

  interface DrawerContext {
    width: number;
    takesSpace: boolean;
    ready: boolean;
  }

  interface NavbarContext {
    height: number;
    ready: boolean;
  }

  export const headerCtx = QContext<AppbarContext>("QHeader");
  export const footerCtx = QContext<AppbarContext>("QFooter");
  export const navbarCtx = QContext<NavbarContext>("QNavbar");

  export const startRailbarCtx = QContext<DrawerContext>("QRailbarStart");
  export const endRailbarCtx = QContext<DrawerContext>("QRailbarEnd");
  export const startDrawerCtx = QContext<DrawerContext>("QDrawerStart");
  export const endDrawerCtx = QContext<DrawerContext>("QDrawerEnd");

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
    railbarStart,
    railbarEnd,
    drawerStart,
    drawerEnd,
    railbarLeft,
    railbarRight,
    drawerLeft,
    drawerRight,
    header,
    footer,
    navbar,
    onscroll,
    children,
    ...props
  }: QLayoutProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let layoutEl = $state<HTMLDivElement>();
  let isAnimated = $state(false);

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
  const navbarInfo = $state({
    height: 0,
    ready: false,
  });
  const startRailbarInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const startDrawerInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const endRailbarInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const endDrawerInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const leftRailbarInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const rightRailbarInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const leftDrawerInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const rightDrawerInfo = $state({
    width: 0,
    takesSpace: false,
    ready: false,
  });
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const topOffset = $derived(!header || headerInfo.collapsed ? 0 : headerInfo.height);
  const footerOffset = $derived(!footer || footerInfo.collapsed ? 0 : footerInfo.height);
  const navbarOffset = $derived(!navbar || !navbarInfo.ready ? 0 : navbarInfo.height);
  const bottomOffset = $derived(footerOffset + navbarOffset);
  const hasRailbar = $derived(railbarStart ?? railbarEnd ?? railbarLeft ?? railbarRight);
  const hasDrawer = $derived(drawerStart ?? drawerEnd ?? drawerLeft ?? drawerRight);
  const leftOffset = $derived(occupiedWidth(leftRailbarInfo) + occupiedWidth(leftDrawerInfo));
  const rightOffset = $derived(occupiedWidth(rightRailbarInfo) + occupiedWidth(rightDrawerInfo));

  const isReady = $derived(
    isLayoutPartReady(header, headerInfo, "q-header") &&
      isLayoutPartReady(footer, footerInfo, "q-footer") &&
      isLayoutPartReady(hasRailbar, leftRailbarInfo, "q-railbar--left") &&
      isLayoutPartReady(hasRailbar, rightRailbarInfo, "q-railbar--right") &&
      isLayoutPartReady(hasDrawer, leftDrawerInfo, "q-drawer--left") &&
      isLayoutPartReady(hasDrawer, rightDrawerInfo, "q-drawer--right") &&
      isLayoutPartReady(hasRailbar, startRailbarInfo, "q-railbar--start") &&
      isLayoutPartReady(hasDrawer, startDrawerInfo, "q-drawer--start") &&
      isLayoutPartReady(hasRailbar, endRailbarInfo, "q-railbar--end") &&
      isLayoutPartReady(hasDrawer, endDrawerInfo, "q-drawer--end") &&
      isLayoutPartReady(navbar, navbarInfo, "q-navbar")
  );
  // #endregion: --- Derived values

  // #region:    --- Context
  // Cleanup must read the latest owner, not an older reactive snapshot.
  const barOwnerIds = { header: "", footer: "" };

  headerCtx.set({
    ownerId: barOwnerIds.header,
    view,
    height: headerInfo.height,
    collapsed: headerInfo.collapsed,
    ready: headerInfo.ready,
  });
  footerCtx.set({
    ownerId: barOwnerIds.footer,
    view,
    height: footerInfo.height,
    collapsed: footerInfo.collapsed,
    ready: footerInfo.ready,
  });
  navbarCtx.set({
    height: navbarInfo.height,
    ready: navbarInfo.ready,
  });

  startRailbarCtx.set({
    width: startRailbarInfo.width,
    takesSpace: startRailbarInfo.takesSpace,
    ready: startRailbarInfo.ready,
  });
  startDrawerCtx.set({
    width: startDrawerInfo.width,
    takesSpace: startDrawerInfo.takesSpace,
    ready: startDrawerInfo.ready,
  });
  endRailbarCtx.set({
    width: endRailbarInfo.width,
    takesSpace: endRailbarInfo.takesSpace,
    ready: endRailbarInfo.ready,
  });
  endDrawerCtx.set({
    width: endDrawerInfo.width,
    takesSpace: endDrawerInfo.takesSpace,
    ready: endDrawerInfo.ready,
  });

  leftRailbarCtx.set({
    width: leftRailbarInfo.width,
    takesSpace: leftRailbarInfo.takesSpace,
    ready: leftRailbarInfo.ready,
  });
  rightRailbarCtx.set({
    width: rightRailbarInfo.width,
    takesSpace: rightRailbarInfo.takesSpace,
    ready: rightRailbarInfo.ready,
  });

  leftDrawerCtx.set({
    width: leftDrawerInfo.width,
    takesSpace: leftDrawerInfo.takesSpace,
    ready: leftDrawerInfo.ready,
  });
  rightDrawerCtx.set({
    width: rightDrawerInfo.width,
    takesSpace: rightDrawerInfo.takesSpace,
    ready: rightDrawerInfo.ready,
  });
  // #endregion: --- Context

  // #region:    --- Functions
  function occupiedWidth(info: DrawerContext) {
    return info.takesSpace ? info.width : 0;
  }

  function isLayoutPartReady(
    snippet: QLayoutProps["header"],
    info: { ready: boolean },
    selector: string
  ) {
    return (
      !snippet || info.ready || (!!layoutEl && !layoutEl.querySelector(`:scope > .${selector}`))
    );
  }
  // #endregion: --- Functions

  onMount(() => {
    // Let initial bar measurements render before enabling layout transitions.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => (isAnimated = true));
    });

    return () => cancelAnimationFrame(frame);
  });

  Q.classes("q-layout", {
    bemClasses: {
      ready: isReady,
      animated: isAnimated,
    },
    classes: [props.class],
  });
</script>

<div
  bind:this={layoutEl}
  {...props}
  class="q-layout"
  style:--physical-left-railbar-width={`${occupiedWidth(leftRailbarInfo)}px`}
  style:--physical-right-railbar-width={`${occupiedWidth(rightRailbarInfo)}px`}
  style:--start-railbar-space={`${occupiedWidth(startRailbarInfo)}px`}
  style:--start-drawer-space={`${occupiedWidth(startDrawerInfo)}px`}
  style:--end-railbar-space={`${occupiedWidth(endRailbarInfo)}px`}
  style:--end-drawer-space={`${occupiedWidth(endDrawerInfo)}px`}
  style:--navbar-height={`${navbarOffset}px`}
  style:--offset-top={`${topOffset}px`}
  style:--physical-offset-right={`${rightOffset}px`}
  style:--offset-bottom={`${bottomOffset}px`}
  style:--physical-offset-left={`${leftOffset}px`}
  style:--left-navigation-top={view.charAt(0) === "h" ? "var(--offset-top)" : "0px"}
  style:--right-navigation-top={view.charAt(2) === "h" ? "var(--offset-top)" : "0px"}
  style:--left-navigation-bottom={view.charAt(8) === "f"
    ? "var(--offset-bottom)"
    : "var(--navbar-height)"}
  style:--right-navigation-bottom={view.charAt(10) === "f"
    ? "var(--offset-bottom)"
    : "var(--navbar-height)"}
  style:--left-navigation-top-radius={view.charAt(0) === "h" ? "16px" : "0px"}
  style:--right-navigation-top-radius={view.charAt(2) === "h" ? "16px" : "0px"}
  style:--left-navigation-bottom-radius={view.charAt(8) === "f" ? "16px" : "0px"}
  style:--right-navigation-bottom-radius={view.charAt(10) === "f" ? "16px" : "0px"}
  style:--left-railbar-z-index={view.charAt(0) === "h" ? 3 : 5}
  style:--right-railbar-z-index={view.charAt(2) === "h" ? 3 : 5}
  style:--left-drawer-z-index={view.charAt(0) === "h" ? 2 : 4}
  style:--right-drawer-z-index={view.charAt(2) === "h" ? 2 : 4}
>
  {@render railbarStart?.()}
  {@render railbarEnd?.()}
  {@render drawerStart?.()}
  {@render drawerEnd?.()}
  {@render railbarLeft?.()}
  {@render railbarRight?.()}
  {@render drawerLeft?.()}
  {@render drawerRight?.()}
  {@render header?.()}
  {@render footer?.()}
  {@render navbar?.()}

  <ContextResetter
    keys={[
      navigationCtx.symbol,
      headerCtx.symbol,
      footerCtx.symbol,
      navbarCtx.symbol,
      startRailbarCtx.symbol,
      endRailbarCtx.symbol,
      startDrawerCtx.symbol,
      endDrawerCtx.symbol,
      leftRailbarCtx.symbol,
      rightRailbarCtx.symbol,
      leftDrawerCtx.symbol,
      rightDrawerCtx.symbol,
    ]}
  >
    <div class="q-layout__content" {onscroll}>
      {#if content}
        {@render content()}
      {:else}
        {@render children?.()}
      {/if}
    </div>
  </ContextResetter>
</div>
