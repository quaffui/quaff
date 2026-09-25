<script lang="ts">
  import { initMeta, QMetaHead } from "$lib/meta";
  import { pageTitle } from "$helpers/pageTitle";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  initMeta({
    title: "Meta",
    titleTemplate: pageTitle,
    meta: {
      description: {
        name: "description",
        content: "Manage page titles and descriptions with Quaff.",
      },
    },
  });
</script>

{@render children()}
<QMetaHead />
