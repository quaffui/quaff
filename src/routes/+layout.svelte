<script lang="ts">
  import "beercss/dist/cdn/beer.min.css";
  import "beercss/dist/cdn/material-symbols-outlined.woff2";
  import "beercss/dist/cdn/material-symbols-rounded.woff2";
  import "beercss/dist/cdn/material-symbols-sharp.woff2";
  import Prism from "prismjs";
  import "prism-svelte";
  import "../lib/css/index.scss";
  import { Quaff } from "$stores/Quaff";
  import {
    QLayout,
    QToolbar,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QDrawer,
  } from "$lib";
  import { isRouteActive } from "$lib/composables/use-router-link";

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

  let selectedRailbarItem: "components" | "utils" | null = isRouteActive(
    $Quaff.router,
    "/components"
  )
    ? "components"
    : isRouteActive($Quaff.router, "/utils")
    ? "utils"
    : null;

  $: showDrawer = selectedRailbarItem !== null;

  $: drawerContent =
    selectedRailbarItem === "components"
      ? components
      : selectedRailbarItem === "utils"
      ? quaffUtils
      : [];

  export let data;
  if (data.isDark) $Quaff.dark.set(true);
</script>

<svelte:head>
  <link
    href="https://cdn.jsdelivr.net/npm/prism-themes@1.4.0/themes/prism-material-dark.css"
    rel="stylesheet"
  />
</svelte:head>

{#if $Quaff.router.route.id === "/layout"}
  <slot />
{:else}
  <QLayout class="main-layout" leftRailbarWidth="120" leftDrawerWidth="15rem">
    <QToolbar slot="header" class="surface small-elevate">
      <h5 class="max center-align">Quaff</h5>
      <QBtn
        icon={$Quaff.dark.isActive ? "light_mode" : "dark_mode"}
        flat
        round
        on:click={() => $Quaff.dark.toggle()}
      />
      <QBtn icon="help" flat />
    </QToolbar>
    <QRailbar slot="railbarLeft" class="surface no-round" bordered>
      <QList>
        <QItem to="/" on:click={() => (selectedRailbarItem = null)}>
          <QIcon name="home" />
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem to="/components" on:click={() => (selectedRailbarItem = "components")}>
          <QIcon name="grid_view" />
          <QItemSection>Components</QItemSection>
        </QItem>
        <QItem to="/grid" on:click={() => (selectedRailbarItem = null)}>
          <QIcon name="grid_on" />
          <QItemSection>Grid</QItemSection>
        </QItem>
        <QItem to="/utils" on:click={() => (selectedRailbarItem = "utils")}>
          <QIcon name="construction" />
          <QItemSection>Quaff utils</QItemSection>
        </QItem>
        <QItem to="/dev" on:click={() => (selectedRailbarItem = null)}>
          <QIcon name="code" />
          <QItemSection>Dev tests</QItemSection>
        </QItem>
        <QItem to="/layout" on:click={() => (selectedRailbarItem = null)}>
          <QIcon name="dashboard_customize" />
          <QItemSection>Layout tests</QItemSection>
        </QItem>
      </QList>
    </QRailbar>
    <QDrawer slot="drawerLeft" persistent value={showDrawer}>
      <QList dense>
        {#each drawerContent as { name, to }}
          <QItem {to}>{name}</QItem>
        {/each}
      </QList>
    </QDrawer>
    <div slot="content">
      <slot />
    </div>
  </QLayout>
{/if}
