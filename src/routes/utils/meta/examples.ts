export const setupExample = `<script lang="ts">
  import { QMeta } from "@quaffui/quaff/meta";

  let { children } = $props();
</script>

<QMeta
  metadata={{
    title: "Home",
    titleTemplate: (title) => title + " | My site",
    meta: {
      description: { name: "description", content: "About my site." },
    },
  }}
>
  {@render children()}
</QMeta>`;

export const pageExample = `<script lang="ts">
  import { useMeta } from "@quaffui/quaff/meta";

  let title = $state("About");

  useMeta(() => ({
    title,
    meta: {
      description: { name: "description", content: "Meet our team." },
      socialTitle: { property: "og:title", content: title },
    },
    link: {
      canonical: { rel: "canonical", href: "https://example.com/about" },
    },
  }));
</script>

<input aria-label="Page title" bind:value={title} />`;
