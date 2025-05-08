<script module lang="ts">
  import { onMount, setContext } from "svelte";
  import { QContext } from "$lib/classes/QContext.svelte";
  import { ContextReseter } from "$private";
  import { QLayoutCtxName } from "$utils";
  import type { QLayoutProps } from "./props";

  export interface AppbarContext {
    height: number;
    collapsed: boolean;
    ready: boolean;
  }

  export interface DrawerContext {
    width: number;
    takesSpace: boolean;
    ready: boolean;
  }
</script>

<script lang="ts">
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

  let contentEl: HTMLDivElement;

  onMount(() => {
    setTimeout(() => {
      contentEl.style.transition = "margin 0.3s";
    }, 100);
  });

  setContext(QLayoutCtxName.view, {
    get value() {
      return view;
    },
  });

  const headerCtx = new QContext<AppbarContext>(QLayoutCtxName.header, {
    height: 0,
    collapsed: false,
    ready: false,
  });

  const footerCtx = new QContext<AppbarContext>(QLayoutCtxName.footer, {
    height: 0,
    collapsed: false,
    ready: false,
  });

  const leftRailbarCtx = new QContext<DrawerContext>(QLayoutCtxName.railbar.left, {
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const rightRailbarCtx = new QContext<DrawerContext>(QLayoutCtxName.railbar.right, {
    width: 0,
    takesSpace: false,
    ready: false,
  });

  const leftDrawerCtx = new QContext<DrawerContext>(QLayoutCtxName.drawer.left, {
    width: 0,
    takesSpace: false,
    ready: false,
  });
  const rightDrawerCtx = new QContext<DrawerContext>(QLayoutCtxName.drawer.right, {
    width: 360,
    takesSpace: false,
    ready: false,
  });

  const topOffset = $derived(!header || headerCtx.value.collapsed ? 0 : headerCtx.value.height);
  const bottomOffset = $derived(!footer || footerCtx.value.collapsed ? 0 : footerCtx.value.height);
  const leftOffset = $derived(handleDrawerCtx(leftRailbarCtx) + handleDrawerCtx(leftDrawerCtx));
  const rightOffset = $derived(handleDrawerCtx(rightRailbarCtx) + handleDrawerCtx(rightDrawerCtx));

  const contentMargin = $derived(
    `${header ? topOffset : 0}px ${rightOffset}px ${footer ? bottomOffset : 0}px ${leftOffset}px`
  );

  const isReady = $derived(
    (!header || headerCtx.value.ready) &&
      (!footer || footerCtx.value.ready) &&
      (!railbarLeft || leftRailbarCtx.value.ready) &&
      (!railbarRight || rightRailbarCtx.value.ready) &&
      (!drawerLeft || leftDrawerCtx.value.ready) &&
      (!drawerRight || rightDrawerCtx.value.ready)
  );

  function handleDrawerCtx(ctx: QContext<DrawerContext>) {
    return ctx.value.takesSpace ? ctx.value.width : 0;
  }

  Q.classes("q-layout", {
    bemClasses: {
      ready: isReady,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-layout"
  style:--left-drawer-width={`${drawerLeft ? leftDrawerCtx.value.width : 0}px`}
  style:--right-drawer-width={`${drawerRight ? rightDrawerCtx.value.width : 0}px`}
  style:--left-railbar-width={`${railbarLeft ? leftRailbarCtx.value.width : 0}px`}
  style:--right-railbar-width={`${railbarRight ? rightRailbarCtx.value.width : 0}px`}
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
      QLayoutCtxName.header,
      QLayoutCtxName.footer,
      QLayoutCtxName.railbar.left,
      QLayoutCtxName.railbar.right,
      QLayoutCtxName.drawer.left,
      QLayoutCtxName.drawer.right,
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
