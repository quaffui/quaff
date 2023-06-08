<script lang="ts">
  import "beercss/dist/cdn/beer.min.css";
  import "beercss/dist/cdn/material-symbols-outlined.woff2";
  import "beercss/dist/cdn/material-symbols-rounded.woff2";
  import "beercss/dist/cdn/material-symbols-sharp.woff2";
  import "../lib/css/index.scss";
  import { Quaff } from "$stores/Quaff";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QItemSection from "$lib/components/list/QItemSection.svelte";
  import QIcon from "$lib/components/icon/QIcon.svelte";
  import QRailbar from "$lib/components/railbar/QRailbar.svelte";

  const components = [
    {
      name: "App bar",
      to: "/components/appbar",
    },
    {
      name: "Card",
      to: "/components/card",
    },
    {
      name: "Layout",
      to: "/components/layout",
    },
    {
      name: "The $Quaff object",
      to: "/components/quaff",
    },
  ];
</script>

{#if $Quaff.router.route.id === "/layout"}
  <slot />
{:else}
  <QLayout leftRailbarWidth="120">
    <QToolbar slot="header" class="surface small-elevate">
      <h5 class="max center-align">Quaff</h5>
      <QBtn
        icon={$Quaff.dark.isActive ? "light_mode" : "dark_mode"}
        flat
        round
        on:click={() => $Quaff.dark.toggle()}
      />
      <QBtn icon="help" flat round />
    </QToolbar>
    <QRailbar slot="railbarLeft" class="surface no-round" bordered>
      <QList>
        <QItem class="column center-align round" to="/" style="gap: 0.25em">
          <QIcon name="home" />
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem class="column center-align round" to="/components" style="gap: 0.25em">
          <QIcon name="grid_view" />
          <QItemSection>Components</QItemSection>
        </QItem>
        <QItem class="column center-align round" to="/utils" style="gap: 0.25em">
          <QIcon name="construction" />
          <QItemSection>Quaff utils</QItemSection>
        </QItem>
        <QItem class="column center-align round" to="/dev" style="gap: 0.25em">
          <QIcon name="code" />
          <QItemSection>Dev tests</QItemSection>
        </QItem>
        <QItem class="column center-align round" to="/layout" style="gap: 0.25em">
          <QIcon name="dashboard_customize" />
          <QItemSection>Layout tests</QItemSection>
        </QItem>
      </QList>
    </QRailbar>
    <QDrawer slot="drawerLeft" persistent value={true}>
      <QList>
        {#each components as { name, to }}
          <QItem class="round" {to}>{name}</QItem>
        {/each}
      </QList>
    </QDrawer>
    <div slot="content">
      <slot />
    </div>
  </QLayout>
{/if}
