<script lang="ts">
  import { QMeta } from "$lib/meta";
  import { pageTitle } from "$helpers/pageTitle";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<QMeta
  metadata={{
    title: "Meta",
    titleTemplate: pageTitle,
    meta: {
      description: {
        name: "description",
        content: "Manage page titles and SEO metadata with Quaff.",
      },
    },
  }}
>
  {@render children()}
</QMeta>
