<script lang="ts">
  import { untrack } from "svelte";
  import QDialog from "#components/dialog/QDialog.svelte";
  import QDrawer from "#components/drawer/QDrawer.svelte";
  import QMenu from "#components/menu/QMenu.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  let dialog = $state(!params.has("menu"));
  let otherDialog = $state(params.has("other"));
  let drawer = $state(params.has("drawer"));
  let menu = $state(params.has("menu"));
  let menuDialog = $state(false);
  let menuAnchor = $state<HTMLButtonElement>();
</script>

<button id="outside" style="margin-left: 600px;">Outside</button>
<p
  id="state"
  data-dialog={dialog}
  data-other-dialog={otherDialog}
  data-drawer={drawer}
  data-menu={menu}
  data-menu-dialog={menuDialog}
></p>
<button id="menu-anchor" bind:this={menuAnchor}>Menu</button>
<QMenu bind:value={menu} target={menuAnchor}>
  <button
    id="open-menu-dialog"
    onclick={(e) => {
      e.preventDefault();
      menuDialog = true;
    }}>Open dialog</button
  >
  <QDialog id="menu-dialog" bind:value={menuDialog} modal aria-label="Menu details">
    <button id="menu-dialog-action">Menu dialog action</button>
  </QDialog>
</QMenu>
<QDrawer id="drawer" bind:value={drawer} noSwipe aria-label="Navigation">
  <button id="drawer-action">Drawer action</button>
</QDrawer>
<QDialog id="dialog" bind:value={dialog} aria-label="Details">
  <button id="dialog-action">Dialog action</button>
  <a id="dialog-link" href="#details">Details</a>
</QDialog>
<QDialog id="other-dialog" bind:value={otherDialog} position="bottom" aria-label="Other">
  <button id="other-dialog-action">Other dialog action</button>
</QDialog>
