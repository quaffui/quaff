export const setupExample = `<script lang="ts">
  import { initMeta, QMetaHead } from "@quaffui/quaff/meta";

  let { children } = $props();

  initMeta({ title: "My site" });
</script>

{@render children()}
<QMetaHead />`;

export const pageExample = `<script lang="ts">
  import { useMeta } from "@quaffui/quaff/meta";

  let title = $state("About");

  useMeta(() => ({
    title,
    meta: {
      description: { name: "description", content: "Meet our team." },
    },
  }));
</script>

<input aria-label="Page title" bind:value={title} />`;
