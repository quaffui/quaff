<script lang="ts">
  import { QBtn, QCodeBlock, QDialog } from "$lib";
  import { docsCtx } from "./QDocs.svelte";
  import type { Snippet } from "svelte";

  type QDocsSectionProps = {
    title: string;
    sectionDescription?: Snippet;
    children?: Snippet;
    noCode?: boolean;
  };

  // #region:    --- Context
  const { snippets } = docsCtx.get() || { snippets: undefined };

  // #endregion: --- Context

  // #region:    --- Props
  let { title, noCode = false, sectionDescription, children }: QDocsSectionProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let dialog = $state(false);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const code = $derived(typeof snippets === "function" ? snippets()[title] : snippets?.[title]);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
  // #endregion: --- Derived values
</script>

<div {id} style="margin-bottom:48px">
  <div class="q-docs-section__header q-mb-sm">
    <h5>{title}</h5>
    {#if code && !noCode}
      <div class="q-docs-section__actions">
        <QBtn icon="code" variant="outlined" round onclick={() => (dialog = true)} />
      </div>
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

<style>
  .q-docs-section__header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .q-docs-section__header h5 {
    flex: 1 1 auto;
    min-width: 0;
  }

  .q-docs-section__actions {
    flex: 0 0 auto;
  }
</style>
