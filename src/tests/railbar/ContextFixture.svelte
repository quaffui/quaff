<script lang="ts">
  import QDrawer from "$components/drawer/QDrawer.svelte";
  import QLayout from "$components/layout/QLayout.svelte";
  import QNavbar from "$components/navbar/QNavbar.svelte";
  import QNavItem from "$components/nav-item/QNavItem.svelte";
  import QRailbar from "$components/railbar/QRailbar.svelte";

  let { expanded }: { expanded: boolean } = $props();
</script>

<QRailbar {expanded}>
  {@render destination("outer-rail")}

  <QNavbar>
    {@render destination("direct-navbar")}
  </QNavbar>

  <QLayout>
    {#snippet navbar()}
      <QNavbar>
        {@render destination("layout-navbar")}
      </QNavbar>
    {/snippet}

    {@render destination("layout-content")}
  </QLayout>

  <QDrawer value={true} behavior="desktop">
    {@render destination("drawer")}
  </QDrawer>

  <QRailbar>
    {@render destination("nested-rail")}
  </QRailbar>
</QRailbar>

{#snippet destination(id: string)}
  <QNavItem {id} icon="inbox" label="Inbox">
    {#snippet badge()}12{/snippet}
  </QNavItem>
{/snippet}
