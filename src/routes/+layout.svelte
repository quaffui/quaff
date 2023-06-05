<script lang="ts">
  import "../lib/css/index.sass";
  import "beercss/dist/cdn/beer.min.css";
  import "beercss/dist/cdn/material-symbols-outlined.woff2";
  import "beercss/dist/cdn/material-symbols-rounded.woff2";
  import "beercss/dist/cdn/material-symbols-sharp.woff2";
  import { Quaff } from "$stores/Quaff";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QItemSection from "$lib/components/list/QItemSection.svelte";

  $: console.log($Quaff);

  let leftDrawer: QDrawer | null = null;
</script>

{#if $Quaff.router.route.id === "/layout"}
  <slot />
{:else}
  <QLayout>
    <QToolbar slot="header" class="primary-container">
      <QBtn icon="menu" flat round on:click={() => leftDrawer?.toggle()} />
      <h5 class="max center-align">Quaff</h5>
      <QBtn
        icon={$Quaff.dark.isActive ? "light_mode" : "dark_mode"}
        flat
        round
        on:click={() => $Quaff.dark.toggle()}
      />
      <QBtn icon="help" flat round />
    </QToolbar>
    <QDrawer
      slot="drawerLeft"
      bind:this={leftDrawer}
      class="primary-container"
      overlay
      style="z-index: 1500"
    >
      <QList>
        <QItem to="/">
          <QItemSection avatar>
            <i>home</i>
          </QItemSection>
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem to="/components">
          <QItemSection avatar>
            <i>grid_view</i>
          </QItemSection>
          <QItemSection>Components</QItemSection>
        </QItem>
        <QItem to="/utils">
          <QItemSection avatar>
            <i>construction</i>
          </QItemSection>
          <QItemSection>Quaff utils</QItemSection>
        </QItem>
        <QItem to="/dev">
          <QItemSection avatar>
            <i>code</i>
          </QItemSection>
          <QItemSection>Dev tests</QItemSection>
        </QItem>
        <QItem to="/layout">
          <QItemSection avatar>
            <i>dashboard_customize</i>
          </QItemSection>
          <QItemSection>Layout tests</QItemSection>
        </QItem>
      </QList>
    </QDrawer>
    <QDrawer slot="drawerRight" />
    <div slot="content">
      <slot />
    </div>
  </QLayout>
{/if}
