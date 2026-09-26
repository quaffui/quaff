<script lang="ts">
  import QNavItem from "$components/nav-item/QNavItem.svelte";
  import QRailbar from "$components/railbar/QRailbar.svelte";
  import type { QRailbarProps } from "$components/railbar/props";

  let { railbar = {} }: { railbar?: Omit<QRailbarProps, "children"> } = $props();
  let filter = $state("Unread");
</script>

<QRailbar {...railbar}>
  <QNavItem icon="inbox" label="Inbox" active badgeAriaLabel="12 unread messages">
    {#snippet badge()}12{/snippet}
  </QNavItem>
  <QNavItem icon="settings" label="Settings" disabled />
  <label>Filter <input data-testid="filter" bind:value={filter} /></label>
</QRailbar>
