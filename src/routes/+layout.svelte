<script lang="ts">
  // Comment this in again while needed during development
  // import "beercss/dist/cdn/beer.min.css";
  import "../lib/css/index.scss";
  import "../lib/css/fonts.scss";

  import { Quaff } from "$stores/Quaff";
  import {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QDrawer,
  } from "$lib";
  import { isRouteActive } from "$lib/composables/use-router-link";
  import { fade } from "svelte/transition";

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
  let contentEl: HTMLDivElement;

  let selectedRailbarItem: "components" | "utils" | null;
  $: selectedRailbarItem = isRouteActive($Quaff.router, "/components")
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

{#if $Quaff.router.route.id === "/layout"}
  <slot />
{:else}
  <QLayout class="main-layout" leftRailbarWidth="120" leftDrawerWidth="15rem">
    <QToolbar slot="header" class="elevate-2">
      <QToolbarTitle>Quaff</QToolbarTitle>
      <QBtn
        icon={$Quaff.dark.isActive ? "light_mode" : "dark_mode"}
        flat
        round
        on:click={$Quaff.dark.toggle}
      />
      <QBtn icon="help" flat />
    </QToolbar>
    <QRailbar slot="railbarLeft" class="surface no-round" bordered>
      <QList>
        <QItem to="/">
          <QIcon name="home" />
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem to="/components">
          <QIcon name="grid_view" />
          <QItemSection>Components</QItemSection>
        </QItem>
        <QItem to="/grid">
          <QIcon name="grid_on" />
          <QItemSection>Grid</QItemSection>
        </QItem>
        <QItem to="/colors">
          <QIcon name="palette" />
          <QItemSection>Colors</QItemSection>
        </QItem>
        <QItem to="/utils">
          <QIcon name="construction" />
          <QItemSection>Quaff utils</QItemSection>
        </QItem>
        <QItem to="/dev">
          <QIcon name="code" />
          <QItemSection>Dev tests</QItemSection>
        </QItem>
        <QItem to="/layout">
          <QIcon name="dashboard_customize" />
          <QItemSection>Layout tests</QItemSection>
        </QItem>
      </QList>
    </QRailbar>
    <QDrawer slot="drawerLeft" persistent value={showDrawer}>
      {#key drawerContent}
        <div in:fade={{ delay: 200, duration: 200 }} out:fade={{ duration: 200 }}>
          <QList dense>
            {#each drawerContent as { name, to }}
              <QItem
                {to}
                on:click={() => contentEl.scrollTo({ top: 0, behavior: "smooth" })}
                activeClass="primary-text"
              >
                {name}
              </QItem>
            {/each}
          </QList>
        </div>
      {/key}
    </QDrawer>
    <div bind:this={contentEl} slot="content">
      <slot />
    </div>
  </QLayout>
{/if}
