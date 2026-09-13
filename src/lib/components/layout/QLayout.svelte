<script module lang="ts">
  import { onMount } from "svelte";
  import ContextResetter from "$internal/ContextResetter.svelte";
  import { QContext } from "$utils/context";
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

  interface NavbarContext {
    height: number;
    ready: boolean;
  }

  export const headerCtx = QContext<AppbarContext>("QHeader");
  export const footerCtx = QContext<AppbarContext>("QFooter");
  export const navbarCtx = QContext<NavbarContext>("QNavbar");

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
  const leftOffset = $derived(occupiedWidth(leftRailbarInfo) + occupiedWidth(leftDrawerInfo));
  const rightOffset = $derived(occupiedWidth(rightRailbarInfo) + occupiedWidth(rightDrawerInfo));

  const isReady = $derived(
    isLayoutPartReady(header, headerInfo, "q-header") &&
      isLayoutPartReady(footer, footerInfo, "q-footer") &&
      isLayoutPartReady(railbarLeft, leftRailbarInfo, "q-railbar--left") &&
      isLayoutPartReady(railbarRight, rightRailbarInfo, "q-railbar--right") &&
      isLayoutPartReady(drawerLeft, leftDrawerInfo, "q-drawer--left") &&
      isLayoutPartReady(drawerRight, rightDrawerInfo, "q-drawer--right") &&
      isLayoutPartReady(navbar, navbarInfo, "q-navbar")
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
  navbarCtx.set({
    height: navbarInfo.height,
    ready: navbarInfo.ready,
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

  // #region:    --- Functions
  function occupiedWidth(info: Omit<DrawerContext, "view">) {
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
  style:--left-drawer-width={`${leftDrawerInfo.width}px`}
  style:--right-drawer-width={`${rightDrawerInfo.width}px`}
  style:--left-railbar-width={`${occupiedWidth(leftRailbarInfo)}px`}
  style:--right-railbar-width={`${occupiedWidth(rightRailbarInfo)}px`}
  style:--navbar-height={`${navbarOffset}px`}
  style:--offset-top={`${topOffset}px`}
  style:--offset-right={`${rightOffset}px`}
  style:--offset-bottom={`${bottomOffset}px`}
  style:--offset-left={`${leftOffset}px`}
>
  {@render railbarLeft?.()}
  {@render railbarRight?.()}
  {@render drawerLeft?.()}
  {@render drawerRight?.()}
  {@render header?.()}
  {@render footer?.()}
  {@render navbar?.()}

  <ContextResetter
    keys={[
      headerCtx.symbol,
      footerCtx.symbol,
      navbarCtx.symbol,
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
