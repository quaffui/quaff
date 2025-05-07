<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { QCodeBlock, QDialog, QBtn } from "$lib";

  type QDocsSectionProps = {
    title: string;
    sectionDescription?: Snippet;
    children?: Snippet;
    noCode?: boolean;
  };

  let { title, noCode = false, sectionDescription, children }: QDocsSectionProps = $props();

  const snippets = getContext<undefined | (() => Record<string, string>)>("QDocsSnippets");

  const code = $derived(snippets && snippets()[title]);

  let dialog = $state(false);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
</script>

<div {id} style="margin-bottom:48px">
  <div class="flex justify-between q-mb-sm">
    <h5>{title}</h5>
    {#if code && !noCode}
      <QBtn icon="code" variant="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal style="max-width: 75vw">
        <QCodeBlock {code} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>

  {#if sectionDescription}
    <div class="q-mb-md" style="text-wrap: balance">
      {@render sectionDescription()}
    </div>
  {/if}

  <div class="q-ma-sm">
    {@render children?.()}
  </div>
</div>
