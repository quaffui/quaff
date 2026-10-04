<script lang="ts">
  import MetaLayout from "./MetaLayout.svelte";
  import type { MetaOptions } from "../../lib/meta.js";

  const PAGES: MetaOptions[] = [
    {
      title: "First page",
      meta: { description: { name: "description", content: "First description" } },
    },
    {
      title: "Second page",
      meta: { description: { name: "description", content: "Second description" } },
    },
    {
      title: "Private page",
      meta: {
        description: null,
        robots: { name: "robots", content: "noindex" },
      },
    },
  ];
  let pages = $state<MetaOptions[]>([PAGES[0]]);
</script>

<MetaLayout defaults={{ title: "Site" }} {pages} />
<button onclick={() => (pages = [PAGES[1]])}>Second page</button>
<button onclick={() => (pages = [PAGES[2]])}>Private page</button>
<button onclick={() => (pages = [])}>Remove page</button>
