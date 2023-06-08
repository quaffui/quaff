<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QItemSection from "$lib/components/list/QItemSection.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import { Quaff } from "$lib/stores/Quaff";

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

<slot />
