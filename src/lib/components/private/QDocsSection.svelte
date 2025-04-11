<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { QCodeBlock, QDialog, QBtn } from "$lib";

  type QDocsSectionProps = {
    title: string;
    sectionDescription?: Snippet;
    children?: Snippet;
  };

  let { title, sectionDescription, children }: QDocsSectionProps = $props();

  const snippets = getContext<() => Record<string, string>>("QDocsSnippets");

  const code = $derived(snippets()[title]);

  let dialog = $state(false);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
</script>

<div {id} style="margin-bottom:48px">
  <div class="flex justify-between q-mb-sm">
    <h5>{title}</h5>
    {#if code}
      <QBtn icon="code" variant="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal>
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
