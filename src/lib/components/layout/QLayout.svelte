<script context="module" lang="ts">
  import { untrack } from "svelte";
  import ContextReseter from "../private/ContextReseter.svelte";
  import type { QLayoutProps } from "./props";
  import QContext from "$lib/classes/QContext.svelte";
  import { isNumeric } from "$lib/utils/number";

  export interface DrawerContext {
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
    display: boolean;
    fixed: boolean;
  }

  export type LayoutContext = {
    header?: AppbarContext;
    footer?: AppbarContext;
    drawerLeft: DrawerContext;
    drawerRight: DrawerContext;
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

  const getStyleValue = (measure: string | number) =>
    isNumeric(measure) ? `${measure}px` : measure;

  Q.classes("q-layout", {
    classes: [props.class],
  });

  function prepareCtx(viewProp: typeof view) {
    const [top, middle, bottom] = viewProp!.split(" ");
    const headerCtx: AppbarContext | undefined = header
      ? {
          display: true,
          fixed: top.includes("H"),
        }
      : undefined;
    const footerCtx: AppbarContext | undefined = footer
      ? {
          display: true,
          fixed: bottom.includes("F"),
        }
      : undefined;
    const drawerLeftCtx: DrawerContext = {
      offset: {
        top: !!header && top[0].toLowerCase() === "h",
        bottom: !!footer && bottom[0].toLowerCase() === "f",
      },
      fixed: [top[0], middle[0], bottom[0]].includes("L"),
      railbar: !!railbarLeft,
      drawer: !!drawerLeft,
      overlay: false,
    };
    const drawerRightCtx: DrawerContext = {
      offset: {
        top: !!header && top[2].toLowerCase() === "h",
        bottom: !!footer && bottom[2].toLowerCase() === "f",
      },
      fixed: [top[2], middle[2], bottom[2]].includes("R"),
      railbar: !!railbarRight,
      drawer: !!drawerRight,
      overlay: false,
    };

    return {
      header: headerCtx,
      footer: footerCtx,
      drawerLeft: drawerLeftCtx,
      drawerRight: drawerRightCtx,
    };
  }

  const ctx = new QContext<LayoutContext>("layout", prepareCtx(view));

  $effect(() => {
    untrack(() => ctx).update(prepareCtx(view));
  });
</script>

<div
  {...props}
  class="q-layout"
  {...Q.classes}
  style:--header-height={getStyleValue(headerHeight)}
  style:--footer-height={getStyleValue(footerHeight)}
  style:--left-railbar-width={getStyleValue(leftRailbarWidth)}
  style:--right-railbar-width={getStyleValue(rightRailbarWidth)}
  style:--left-drawer-width={getStyleValue(leftDrawerWidth)}
  style:--right-drawer-width={getStyleValue(rightDrawerWidth)}
  {onscroll}
  {onresize}
>
  {#if railbarLeft}
    {@render railbarLeft()}
  {/if}
  {#if railbarRight}
    {@render railbarRight()}
  {/if}
  {#if drawerLeft}
    {@render drawerLeft()}
  {/if}
  {#if drawerRight}
    {@render drawerRight()}
  {/if}
  {#if header}
    {@render header()}
  {/if}
  {#if footer}
    {@render footer()}
  {/if}
  <ContextReseter keys="layout">
    {#snippet children()}
      {#if content}
        {@render content()}
      {/if}
    {/snippet}
  </ContextReseter>
</div>
