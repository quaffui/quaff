<script lang="ts">
  import QDrawer from "$components/drawer/QDrawer.svelte";
  import QDialog from "$components/dialog/QDialog.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import QRailbar from "$components/railbar/QRailbar.svelte";
  import "$css/base.scss";
  import "$css/components/drawer.scss";
  import "$css/components/dialog.scss";
  import "$css/components/menu.scss";
  import "$css/components/railbar.scss";

  const params = new URLSearchParams(window.location.search);
  let drawer = $state(false);
  let dialog = $state(false);
  let menu = $state(false);
  let menuAnchor = $state<HTMLButtonElement>();
</script>

<button id="open-drawer" style="margin-left: 400px;" onclick={() => (drawer = true)}>
  Open navigation
</button>
<button id="outside">Outside</button>
{#if params.has("rail")}
  <QRailbar id="rail" aria-label="Rail navigation">
    <button>Rail destination</button>
  </QRailbar>
{/if}
<QDrawer id="drawer" bind:value={drawer} overlay noSwipe aria-label="Navigation">
  <button id="open-dialog" onclick={() => (dialog = true)}>Open dialog</button>
  <button id="open-menu" bind:this={menuAnchor} onclick={() => (menu = true)}>Open menu</button>
  <QMenu bind:value={menu} target={menuAnchor}>
    <button id="menu-action">Menu action</button>
  </QMenu>
  <button id="close-drawer" onclick={() => (drawer = false)}>Close navigation</button>
</QDrawer>
<QDialog id="dialog" bind:value={dialog} modal={params.has("modal")} aria-label="Details">
  <button id="dialog-action">Dialog action</button>
</QDialog>
