<script lang="ts">
  import { getMetaContext } from "../../internal/metaContext.svelte.js";
  import type { MetaTag } from "./types.js";

  const context = getMetaContext();
  const metadata = $derived(context.resolve());

  function getMetaAttributes({ template, ...attributes }: MetaTag) {
    if (template) {
      attributes.content = template(attributes.content ?? "");
    }

    return attributes;
  }
</script>

<svelte:head>
  <title>{metadata.title}</title>

  {#each Object.entries(metadata.meta) as [key, attributes] (key)}
    {#if attributes}
      <meta {...getMetaAttributes(attributes)} />
    {/if}
  {/each}

  {#each Object.entries(metadata.link) as [key, attributes] (key)}
    {#if attributes}
      <link {...attributes} />
    {/if}
  {/each}
</svelte:head>
