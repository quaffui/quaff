<script context="module" lang="ts">
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

  export type LayoutContext = Readable<{
    header?: AppbarContext;
    footer?: AppbarContext;
    drawerLeft: DrawerContext;
    drawerRight: DrawerContext;
  }>;
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import type { QLayoutProps } from "./props";
  import { createClasses, createStyles } from "$lib/utils/props";
  import ContextReseter from "../private/ContextReseter.svelte";
  import { writable } from "svelte/store";
  import type { Readable } from "svelte/store";

  export let view: QLayoutProps["view"] = "hhh lpr fff",
    headerHeight: QLayoutProps["headerHeight"] = "64px",
    footerHeight: QLayoutProps["footerHeight"] = "80px",
    leftDrawerWidth: QLayoutProps["leftDrawerWidth"] = "300px",
    rightDrawerWidth: QLayoutProps["rightDrawerWidth"] = "300px",
    leftRailbarWidth: QLayoutProps["leftRailbarWidth"] = "88px",
    rightRailbarWidth: QLayoutProps["rightDrawerWidth"] = "88px",
    userClasses: QLayoutProps["userClasses"] = undefined,
    userStyles: QLayoutProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: style = createStyles(
    {
      "--header-height": isNaN(Number(headerHeight)) ? headerHeight : `${headerHeight}px`,
      "--footer-height": isNaN(Number(footerHeight)) ? footerHeight : `${footerHeight}px`,
      "--left-railbar-width": isNaN(Number(leftRailbarWidth))
        ? leftRailbarWidth
        : `${leftRailbarWidth}px`,
      "--right-railbar-width": isNaN(Number(rightRailbarWidth))
        ? rightRailbarWidth
        : `${rightRailbarWidth}px`,
      "--left-drawer-width": isNaN(Number(leftDrawerWidth))
        ? leftDrawerWidth
        : `${leftDrawerWidth}px`,
      "--right-drawer-width": isNaN(Number(rightDrawerWidth))
        ? rightDrawerWidth
        : `${rightDrawerWidth}px`,
    },
    userStyles
  );

  $: classes = createClasses(["q-layout", userClasses]);

  function prepareCtx(viewProp: typeof view) {
    const [top, middle, bottom] = viewProp.split(" ");
    const header: AppbarContext | undefined = $$slots.header
      ? {
          display: true,
          fixed: top.includes("H"),
        }
      : undefined;
    const footer: AppbarContext | undefined = $$slots.footer
      ? {
          display: true,
          fixed: bottom.includes("F"),
        }
      : undefined;
    const drawerLeft: DrawerContext = {
      offset: {
        top: $$slots.header && top[0].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[0].toLowerCase() === "f",
      },
      fixed: [top[0], middle[0], bottom[0]].includes("L"),
      railbar: $$slots.railbarLeft === true,
      drawer: $$slots.drawerLeft === true,
      overlay: false,
    };
    const drawerRight: DrawerContext = {
      offset: {
        top: $$slots.header && top[2].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[2].toLowerCase() === "f",
      },
      fixed: [top[2], middle[2], bottom[2]].includes("R"),
      railbar: $$slots.railbarRight === true,
      drawer: $$slots.drawerRight === true,
      overlay: false,
    };

    return {
      header,
      footer,
      drawerLeft,
      drawerRight,
    };
  }

  let ctx: LayoutContext = writable(prepareCtx(view));
  $: $ctx = prepareCtx(view);
  setContext("layout", ctx);
</script>

<div class={classes} {style} on:scroll on:resize>
  {#if $$slots.railbarLeft}
    <slot name="railbarLeft" />
  {/if}
  {#if $$slots.railbarRight}
    <slot name="railbarRight" />
  {/if}
  {#if $$slots.drawerLeft}
    <slot name="drawerLeft" />
  {/if}
  {#if $$slots.drawerRight}
    <slot name="drawerRight" />
  {/if}
  {#if $$slots.header}
    <slot name="header" />
  {/if}
  {#if $$slots.footer}
    <slot name="footer" />
  {/if}
  <ContextReseter keys="layout">
    <slot name="content" />
  </ContextReseter>
</div>
