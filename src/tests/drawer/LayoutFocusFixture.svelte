<script lang="ts">
  import QLayout from "$components/layout/QLayout.svelte";
  import QDrawer from "$components/drawer/QDrawer.svelte";
  import "$css/base.scss";
  import "$css/components/layout.scss";
  import "$css/components/drawer.scss";

  let isOpen = $state(false);
</script>

<QLayout id="layout" style="width: 600px; height: 400px;">
  {#snippet drawerRight()}
    <QDrawer
      id="drawer"
      side="right"
      bind:value={isOpen}
      overlay
      bordered
      noSwipe
      aria-label="Navigation"
    >
      <div id="drawer-list" style="height: 200px; overflow: auto;">
        <button id="drawer-action">Drawer action</button>
        <div style="height: 800px;"></div>
      </div>
      <div style="height: 800px;"></div>
    </QDrawer>
  {/snippet}

  <button id="open-drawer" onclick={() => (isOpen = true)}>Open navigation</button>
</QLayout>
