<script lang="ts">
  import { QCodeBlock, QDialog, QBtn } from "$lib";
  import type { Snippet } from "svelte";

  type QDocsSectionProps = {
    title: string;
    snippet?: string;
    sectionDescription?: Snippet;
    children?: Snippet;
  };

  let { title, snippet, sectionDescription, children }: QDocsSectionProps = $props();

  let dialog = $state(false);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
</script>

<div {id} style="margin-bottom:48px">
  <div class="flex justify-between q-mb-sm">
    <h5>{title}</h5>
    {#if snippet}
      <QBtn icon="code" variant="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal>
        <QCodeBlock code={snippet} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>

  {#if sectionDescription}
    <div class="q-mb-md" style="text-wrap: balance">
      {@render sectionDescription()}
    </div>
  {/if}

  {@render children?.()}
</div>
