<script lang="ts">
  // Comment this in again while needed during development
  //import "beercss/dist/cdn/beer.min.css";
  import "../lib/css/index.scss";
  import "../lib/css/fonts.scss";

  import { Quaff } from "$stores/Quaff";
  import {
    QLayout,
    QToolbarTitle,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QDrawer,
    QHeader,
    QAvatar,
  } from "$lib";
  import { isRouteActive } from "$lib/composables/useRouterLink";
  import { fade } from "svelte/transition";
  import { QTheme } from "$lib/stores/QTheme";

  const pages = [
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
      name: "Grid",
      icon: "grid_on",
      to: "/grid",
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
    {
      name: "Dev tests",
      icon: "code",
      to: "/dev",
    },
    {
      name: "Layout tests",
      icon: "dashboard_customize",
      to: "/layout",
    },
  ];
  const components = [
    {
      name: "Avatar",
      to: "/components/avatar",
    },
    {
      name: "Button",
      to: "/components/button",
    },
    {
      name: "Card",
      to: "/components/card",
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
      name: "Dialog",
      to: "/components/dialog",
    },
    {
      name: "Drawer",
      to: "/components/drawer",
    },
    {
      name: "Footer",
      to: "/components/footer",
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
      name: "Progress",
      to: "/components/progress",
    },
    {
      name: "Radio",
      to: "/components/radio",
    },
    {
      name: "Railbar",
      to: "/components/railbar",
    },
    {
      name: "Select",
      to: "/components/select",
    },
    {
      name: "Separator",
      to: "/components/separator",
    },
    {
      name: "Tabs",
      to: "/components/tabs",
    },
    {
      name: "Table",
      to: "/components/table",
    },
    {
      name: "Toggle",
      to: "/components/toggle",
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
  const quaffUtils = [
    {
      name: "The $Quaff object",
      to: "/utils/quaff",
    },
  ];
  const colors = [
    "#3499E7",
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

  let contentEl: HTMLDivElement;
  let drawerLeft: QDrawer;
  let drawerRight: QDrawer;

  let selectedRailbarItem: "components" | "utils" | null;
  $: selectedRailbarItem = isRouteActive($Quaff.router, "/components")
    ? "components"
    : isRouteActive($Quaff.router, "/utils")
      ? "utils"
      : null;

  $: if (selectedRailbarItem !== null) {
    drawerLeft?.show();
  } else {
    drawerLeft?.hide();
  }

  $: drawerContent =
    selectedRailbarItem === "components"
      ? components
      : selectedRailbarItem === "utils"
        ? quaffUtils
        : [];

  export let data;
  if (data.isDark) {
    $Quaff.dark.set(true);
  }
</script>

{#if $Quaff.router.route.id === "/layout"}
  <slot />
{:else}
  <QLayout
    view="hhr lpr fff"
    class="main-layout"
    leftRailbarWidth="120"
    leftDrawerWidth="15rem"
    rightDrawerWidth="30vw"
  >
    <QHeader slot="header" class="elevate-2">
      <QToolbarTitle>Quaff</QToolbarTitle>
      <QBtn
        icon={$Quaff.dark.isActive ? "light_mode" : "dark_mode"}
        design="flat"
        round
        onclick={() => $Quaff.dark.toggle()}
      />
      <QBtn icon="palette" design="flat" onclick={() => drawerRight.toggle()} />
    </QHeader>
    <QRailbar slot="railbarLeft" class="surface no-round" bordered>
      <QList>
        {#each pages as { name, icon, to }}
          <QItem {to} noRipple>
            <QIcon name={icon} />
            <QItemSection>{name}</QItemSection>
          </QItem>
        {/each}
      </QList>
    </QRailbar>
    <QDrawer slot="drawerLeft" persistent bind:this={drawerLeft}>
      {#key drawerContent}
        <div in:fade={{ delay: 200, duration: 200 }} out:fade={{ duration: 200 }}>
          <QList dense>
            {#each drawerContent as { name, to }}
              <QItem
                {to}
                on:click={() => contentEl.scrollTo({ top: 0, behavior: "smooth" })}
                activeClass="text-primary"
              >
                {name}
              </QItem>
            {/each}
          </QList>
        </div>
      {/key}
    </QDrawer>
    <QDrawer slot="drawerRight" side="right" bind:this={drawerRight} overlay bordered>
      <div class="q-pa-md">
        <h6 class="q-mb-lg">Want a different color theme?</h6>
        <div class="flex q-gap-md">
          {#each colors as color}
            <QAvatar
              shape="rounded"
              style="background-color:{color}; cursor: pointer; border: solid 0.0625rem var(--outline)"
              on:click={() => QTheme.setTheme(color)}
            />
          {/each}
        </div>
      </div>
    </QDrawer>
    <div bind:this={contentEl} slot="content">
      <slot />
    </div>
  </QLayout>
{/if}
