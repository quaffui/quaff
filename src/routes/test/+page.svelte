<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";

  let leftDrawer: QDrawer | null = null;
  let rightDrawer: QDrawer | null = null;
</script>

<QLayout view="lHh LpR fFf">
  <QToolbar slot="header" class="text-primary">
    <QBtn icon="menu" flat round on:click={() => leftDrawer?.toggle()} />
    <h5 class="max center-align">Title</h5>
    <QBtn flat round icon="attach_file" />
    <QBtn flat round icon="today" />
    <QBtn icon="menu" flat round on:click={() => rightDrawer?.toggle()} />
  </QToolbar>
  <QDrawer bind:this={leftDrawer} slot="drawerLeft" class="primary">Hello world</QDrawer>
  <QDrawer slot="drawerRight" side="right" class="secondary" bind:this={rightDrawer}>
    Hello world
  </QDrawer>
</QLayout>
