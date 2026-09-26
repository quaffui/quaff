<script lang="ts">
  import "$lib/css/fonts.scss";
  import "$lib/css/index.scss";

  import { afterNavigate } from "$app/navigation";
  import {
    QAvatar,
    QBtn,
    QIconBtn,
    QDrawer,
    QHeader,
    QHeaderTitle,
    QLayout,
    QNavItem,
    QNavbar,
    QRailbar,
    QTheme,
    Quaff,
  } from "$lib";
  import { isRouteActive } from "$utils";
  import QDocsNavigation, {
    getNavigationLinks,
    type NavigationItem,
  } from "$docs/QDocsNavigation.svelte";
  import type { MaterialSymbol } from "material-symbols";
  import type { Snapshot } from "@sveltejs/kit";

  type Item = {
    name: string;
    to: string;
  };

  const { children } = $props();

  Quaff.init();

  let chosenColor = $state(0);

  const PAGES: { name: string; icon: MaterialSymbol; to: string }[] = [
    {
      name: "Home",
      icon: "home",
      to: "/",
    },
    {
      name: "Components",
      icon: "grid_view",
      to: "/components",
    },
    {
      name: "Layout",
      icon: "view_quilt",
      to: "/layout/pages",
    },
    {
      name: "Colors",
      icon: "palette",
      to: "/colors",
    },
    {
      name: "Quaff utils",
      icon: "construction",
      to: "/utils",
    },
  ];
  const COMPONENTS: NavigationItem[] = [
    {
      name: "Avatar",
      to: "/components/avatar",
    },
    {
      name: "Badge",
      to: "/components/badge",
    },
    {
      name: "Breadcrumbs",
      to: "/components/breadcrumbs",
    },
    {
      name: "Buttons",
      children: [
        {
          name: "Button",
          to: "/components/button",
        },
        {
          name: "Button Groups",
          to: "/components/button-group",
        },
        {
          name: "FABs",
          to: "/components/fab",
        },
        {
          name: "Icon Button",
          to: "/components/button-icon",
        },
        {
          name: "Split Button",
          to: "/components/split-button",
        },
      ],
    },
    {
      name: "Card",
      to: "/components/card",
    },
    {
      name: "Carousel",
      to: "/components/carousel",
    },
    {
      name: "Checkbox",
      to: "/components/checkbox",
    },
    {
      name: "Chip",
      to: "/components/chip",
    },
    {
      name: "Date & Time",
      children: [
        {
          name: "Date",
          to: "/components/date",
        },
        {
          name: "Time",
          to: "/components/time",
        },
      ],
    },
    {
      name: "Dialog",
      to: "/components/dialog",
    },
    {
      name: "Expansion Item",
      to: "/components/expansion-item",
    },
    {
      name: "Footer",
      to: "/components/footer",
    },
    {
      name: "Header",
      to: "/components/header",
    },
    {
      name: "Icon",
      to: "/components/icon",
    },
    {
      name: "Input",
      to: "/components/input",
    },
    {
      name: "Layout",
      to: "/components/layout",
    },
    {
      name: "List",
      to: "/components/list",
    },
    {
      name: "Loading & Progress",
      children: [
        {
          name: "Loading Indicator",
          to: "/components/loading-indicator",
        },
        {
          name: "Progress",
          to: "/components/progress",
        },
      ],
    },
    {
      name: "Menu",
      to: "/components/menu",
    },
    {
      name: "Navigation",
      children: [
        {
          name: "Drawer",
          to: "/components/drawer",
        },
        {
          name: "Navigation Items",
          to: "/components/nav-item",
        },
        {
          name: "Navbar",
          to: "/components/navbar",
        },
        {
          name: "Railbar",
          to: "/components/railbar",
        },
      ],
    },
    {
      name: "Radio",
      to: "/components/radio",
    },
    {
      name: "Search",
      to: "/components/search",
    },
    {
      name: "Select",
      to: "/components/select",
    },
    {
      name: "Sheets",
      children: [
        {
          name: "Bottom Sheet",
          to: "/components/bottom-sheet",
        },
        {
          name: "Side Sheet",
          to: "/components/side-sheet",
        },
      ],
    },
    {
      name: "Slider",
      to: "/components/slider",
    },
    {
      name: "Snackbar",
      to: "/components/snackbar",
    },
    {
      name: "Separator",
      to: "/components/separator",
    },
    {
      name: "Switch",
      to: "/components/switch",
    },
    {
      name: "Table",
      to: "/components/table",
    },
    {
      name: "Tabs",
      to: "/components/tabs",
    },
    {
      name: "Toolbar",
      to: "/components/toolbar",
    },
    {
      name: "Tooltip",
      to: "/components/tooltip",
    },
  ];

  const QUAFF_UTILS: Item[] = [
    {
      name: "CSS Tree Shaking",
      to: "/utils/css",
    },
    {
      name: "Meta",
      to: "/utils/meta",
    },
    {
      name: "Notify",
      to: "/utils/notify",
    },
    {
      name: "The Quaff class",
      to: "/utils/quaff",
    },
    {
      name: "Right-to-left layouts",
      to: "/utils/rtl",
    },
    {
      name: "QTheme",
      to: "/utils/q-theme",
    },
    {
      name: "QScrollObserver",
      to: "/utils/q-scroll-observer",
    },
  ];

  const LAYOUT_PAGES: Item[] = [
    {
      name: "Pages",
      to: "/layout/pages",
    },
    {
      name: "Grid",
      to: "/layout/grid",
    },
  ];

  const colors = [
    "#0039b4",
    ...[
      "red",
      "blue-grey",
      "green",
      "yellow",
      "orange",
      "indigo",
      "teal",
      "deep-purple",
      "brown",
    ].map((color: string) => `var(--color-${color})`),
  ];

  let contentEl = $state<HTMLDivElement>();
  let drawerLeftEl = $state<ReturnType<typeof QDrawer>>();
  let drawerRightEl = $state<ReturnType<typeof QDrawer>>();

  const selectedSection = $derived(getSelectedSection());

  const previousItem = $derived(
    prepareItem(selectedSection, Quaff.router.url.pathname, "previous")
  );
  const nextItem = $derived(prepareItem(selectedSection, Quaff.router.url.pathname, "next"));

  const drawerContent = $derived(getDrawerItems(selectedSection));
  const isMobile = $derived(Quaff.breakpoints.isLessThan("md"));
  const primaryNav = $derived(isMobile ? { navbar } : { railbarLeft });

  export const snapshot: Snapshot<number> = {
    capture: () => contentEl?.parentElement?.scrollTop ?? 0,
    restore: scrollContent,
  };

  afterNavigate(({ from, to, type }) => {
    if (!from?.url || !to || type === "popstate" || from.url.pathname === to.url.pathname) {
      return;
    }

    const section = document.getElementById(decodeURIComponent(to.url.hash.slice(1)));

    if (!section) {
      scrollContent(0);
    }
  });

  function scrollContent(top: number) {
    contentEl?.parentElement?.scrollTo({ top, behavior: "instant" });
  }

  function prepareItem(selected: string | null, route: string, kind: "previous" | "next") {
    const path = getNavigationLinks(getDrawerItems(selected));

    if (!path.length || Quaff.breakpoints.isMoreThan("md", true)) {
      return null;
    }

    const currentIndex = path.findIndex((item) => item.to === route);

    if (currentIndex === -1) {
      return null;
    }

    if (kind === "previous" && currentIndex > 0) {
      return path[currentIndex - 1];
    } else if (kind === "next" && currentIndex < path.length - 1) {
      return path[currentIndex + 1];
    }

    return null;
  }

  function getSelectedSection() {
    if (isRouteActive("/components")) {
      return "/components";
    }

    if (isRouteActive("/layout")) {
      return "/layout";
    }

    if (isRouteActive("/utils")) {
      return "/utils";
    }

    return null;
  }

  function getDrawerItems(selected: string | null) {
    const ITEMS_BY_SECTION = {
      "/components": COMPONENTS,
      "/layout": LAYOUT_PAGES,
      "/utils": QUAFF_UTILS,
    };

    if (ITEMS_BY_SECTION[selected as keyof typeof ITEMS_BY_SECTION]) {
      return ITEMS_BY_SECTION[selected as keyof typeof ITEMS_BY_SECTION];
    }

    return [];
  }
</script>

<QLayout view="hhr lpr fff" {drawerLeft} {...primaryNav}>
  {#snippet header()}
    <QHeader class="elevate-2">
      {#if isMobile}
        <QIconBtn
          icon="menu"
          variant="flat"
          aria-label="Open section navigation"
          disabled={!drawerContent.length}
          onclick={drawerLeftEl?.toggle}
        />
      {/if}

      <QHeaderTitle>Quaff</QHeaderTitle>
      <QIconBtn
        icon={Quaff.darkMode.isActive ? "light_mode" : "dark_mode"}
        variant="flat"
        onclick={Quaff.darkMode.toggle}
      />
      <QIconBtn icon="palette" variant="flat" onclick={drawerRightEl?.toggle} />
    </QHeader>
  {/snippet}

  {#snippet drawerRight()}
    <QDrawer side="right" bind:this={drawerRightEl} overlay bordered>
      <div class="q-pa-md">
        <h6 class="q-mb-lg">Want a different color theme?</h6>
        <div class="flex q-gap-md">
          {#each colors as color, index (index)}
            <QIconBtn
              onclick={() => {
                chosenColor = index;
                QTheme.setTheme(color);
              }}
              disabled={chosenColor === index}
            >
              <QAvatar
                class={chosenColor === index ? "chosen" : ""}
                size="40px"
                style="background-color:{color}; border: solid 1px var(--outline)"
              />
            </QIconBtn>
          {/each}
        </div>
      </div>
    </QDrawer>
  {/snippet}

  {#snippet content()}
    <div bind:this={contentEl} class="q-docs-layout__content">
      {@render children?.()}

      {#if Quaff.breakpoints.isLessThan("md") && (nextItem || previousItem)}
        <div class="q-px-md flex justify-center q-gap-md" style="padding-bottom: 64px;">
          {#if previousItem}
            <QBtn icon="arrow_back" label={previousItem.name} to={previousItem.to} filled />
          {/if}

          {#if nextItem}
            <QBtn icon="arrow_forward" label={nextItem.name} to={nextItem.to} filled />
          {/if}
        </div>
      {/if}

      <div class="privacy-policy">
        <a class="q-docs-link" href="/privacy-policy">Privacy Policy</a>
      </div>
    </div>
  {/snippet}
</QLayout>

{#snippet primaryNavigationItems(noRipple = false)}
  {#each PAGES as { name, icon, to } (`${name}-${icon}-${to}`)}
    <QNavItem
      {icon}
      label={name}
      {to}
      active={to === "/layout/pages" ? isRouteActive("/layout") : undefined}
      {noRipple}
    />
  {/each}
{/snippet}

{#snippet railbarLeft()}
  <QRailbar class="surface" bordered width={120}>
    {@render primaryNavigationItems(true)}
  </QRailbar>
{/snippet}

{#snippet navbar()}
  <QNavbar>
    {@render primaryNavigationItems()}
  </QNavbar>
{/snippet}

{#snippet drawerLeft()}
  <QDrawer
    value={!isMobile && !!drawerContent.length}
    persistent={!isMobile}
    behavior={isMobile ? "mobile" : "desktop"}
    noSwipe={!drawerContent.length}
    bind:this={drawerLeftEl}
    width={220}
    bordered
  >
    <QDocsNavigation items={drawerContent} label="Section navigation" dense />
  </QDrawer>
{/snippet}

<style>
  :global(.q-avatar.chosen::after) {
    content: "✔️";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: transparent;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  :global(.q-docs-code) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 4px 8px;
    border-radius: 8px;
    background-color: var(--surface-container);
    color: inherit;
    vertical-align: baseline;
  }

  :global(.q-docs-link),
  :global(.q-api :is(a.link, .prop-description a)) {
    display: inline;
    color: var(--primary);
    vertical-align: baseline;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    border-radius: 2px;
  }

  :global(.q-docs-link:is(:hover, :active)),
  :global(.q-api :is(a.link, .prop-description a):is(:hover, :active)) {
    text-decoration-thickness: 2px;
  }

  :global(.q-docs-link:focus-visible),
  :global(.q-api :is(a.link, .prop-description a):focus-visible) {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .q-docs-layout__content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .privacy-policy {
    margin-top: auto;
    text-align: center;
    padding: 48px 16px 16px;
    font-size: 0.8rem;
  }
</style>
