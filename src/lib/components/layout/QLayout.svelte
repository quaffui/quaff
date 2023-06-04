<script context="module" lang="ts">
  export interface DrawerContext {
    offset: {
      top: boolean;
      bottom: boolean;
    };
    fixed: boolean;
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
    userClasses: QLayoutProps["userClasses"],
    userStyles: QLayoutProps["userStyles"];
  export { userClasses as class, userStyles as style };

  $: style = createStyles({
    width: "100%",
    minWidth: "100%",
    height: "100%",
    minHeight: "100%",
    userStyles,
  });

  $: classes = createClasses(["q-layout", userClasses]);

  function prepareCtx(viewProp: typeof view) {
    const [top, middle, bottom] = viewProp.split(" ");
    const header = {
      offset: {
        left: $$slots.drawerLeft && top[0].toLowerCase() === "l",
        right: $$slots.drawerRight && top[2].toLowerCase() === "r",
      },
      fixed: top.includes("H"),
    };
    const footer = {
      offset: {
        left: $$slots.drawerLeft && bottom[0].toLowerCase() === "l",
        right: $$slots.drawerRight && bottom[2].toLowerCase() === "r",
      },
      fixed: bottom.includes("F"),
    };
    const drawerLeft = {
      offset: {
        top: $$slots.header && top[0].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[0].toLowerCase() === "f",
      },
      fixed: [top[0], middle[0], bottom[0]].includes("L"),
    };
    const drawerRight = {
      offset: {
        top: $$slots.header && top[2].toLowerCase() === "h",
        bottom: $$slots.footer && bottom[2].toLowerCase() === "f",
      },
      fixed: [top[2], middle[2], bottom[2]].includes("R"),
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
  <slot />
  {#if $$slots.header}
    <slot name="header" />
  {/if}
  {#if $$slots.drawerLeft}
    <slot name="drawerLeft" />
  {/if}
  {#if $$slots.drawerRight}
    <slot name="drawerRight" />
  {/if}
  {#if $$slots.footer}
    <slot name="footer" />
  {/if}
</div>

<style lang="scss">
  :global(.q-layout > :not(.q-drawer, .q-header, .q-footer)) {
    transition: padding var(--speed3);
    height: 100%;
    &:has(~ .q-header) {
      padding-top: 64px;
    }
    &:has(~ .q-drawer.left.active:not(.mini, .overlay)) {
      padding-left: 300px;
    }
    &:has(~ .q-drawer.left.active.mini:not(.overlay)) {
      padding-left: 57px;
    }
    &:has(~ .q-drawer.right.active:not(.mini, .overlay)) {
      padding-right: 300px;
    }
    &:has(~ .q-drawer.right.active.mini:not(.overlay)) {
      padding-right: 57px;
    }
  }
</style>
