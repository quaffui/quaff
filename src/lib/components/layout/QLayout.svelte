<script context="module" lang="ts">
  export interface DrawerContext {
    offset: {
      top: boolean;
      bottom: boolean;
    };
    fixed: boolean;
    railbar: boolean;
    drawer: boolean;
  }

  export interface AppbarContext {
    offset: {
      left: boolean;
      right: boolean;
    };
    fixed: boolean;
  }
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { type QLayoutProps } from "./props";
  import { createClasses, createStyles } from "$lib/utils/props";

  export let view: QLayoutProps["view"] = "hhh lpr fff",
    leftDrawerWidth: QLayoutProps["leftDrawerWidth"] = 300,
    rightDrawerWidth: QLayoutProps["rightDrawerWidth"] = 300,
    leftRailbarWidth: QLayoutProps["leftRailbarWidth"] = 88,
    rightRailbarWidth: QLayoutProps["rightDrawerWidth"] = 88,
    userClasses: QLayoutProps["userClasses"] = undefined,
    userStyles: QLayoutProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: style = createStyles({
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
    userStyles,
  });

  $: classes = createClasses(["q-layout", userClasses]);

  function prepareCtx(viewProp: typeof view) {
    const [top, middle, bottom] = viewProp.split(" ");
    const header: AppbarContext = {
      offset: {
        left: $$slots.drawerLeft && top[0].toLowerCase() === "l",
        right: $$slots.drawerRight && top[2].toLowerCase() === "r",
      },
      fixed: top.includes("H"),
    };
    const footer: AppbarContext = {
      offset: {
        left: $$slots.drawerLeft && bottom[0].toLowerCase() === "l",
        right: $$slots.drawerRight && bottom[2].toLowerCase() === "r",
      },
      fixed: bottom.includes("F"),
    };
    const drawerLeft: DrawerContext = {
      offset: {
        top: $$slots.header && top[0].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[0].toLowerCase() === "f",
      },
      fixed: [top[0], middle[0], bottom[0]].includes("L"),
      railbar: $$slots.railbarLeft === true,
      drawer: $$slots.drawerLeft === true,
    };
    const drawerRight: DrawerContext = {
      offset: {
        top: $$slots.header && top[2].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[2].toLowerCase() === "f",
      },
      fixed: [top[2], middle[2], bottom[2]].includes("R"),
      railbar: $$slots.railbarRight === true,
      drawer: $$slots.drawerRight === true,
    };

    return {
      header,
      footer,
      drawerLeft,
      drawerRight,
    };
  }

  $: ctx = prepareCtx(view);
  $: if (ctx !== undefined) {
    setContext("header", ctx.header);
    setContext("footer", ctx.footer);
    setContext("drawerLeft", ctx.drawerLeft);
    setContext("drawerRight", ctx.drawerRight);
  }
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
  <slot name="content" />
</div>
