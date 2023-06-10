<script lang="ts">
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
