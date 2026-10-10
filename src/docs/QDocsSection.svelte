<script lang="ts">
  import { QCodeBlock, QDialog, QIconBtn } from "$lib";
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
  let isCodeOpen = $state(false);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const code = $derived(typeof snippets === "function" ? snippets()[title] : snippets?.[title]);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
  // #endregion: --- Derived values
</script>

<div {id} class="q-mb-xl">
  <div class="q-docs-section__header flex no-wrap items-start q-gap-md q-mb-sm">
    <h5 class="min-width-0">{title}</h5>
    {#if code && !noCode}
      <div class="q-docs-section__actions">
        <QIconBtn icon="code" variant="outlined" onclick={() => (isCodeOpen = true)} />
      </div>
      <QDialog
        bind:value={isCodeOpen}
        modal
        class="q-docs-section__code-dialog column overflow-hidden"
      >
        {#if isCodeOpen}
          <QCodeBlock {code} language="svelte" {title} copiable />
        {/if}
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
  .q-docs-section__header h5 {
    flex: 1 1 auto;
  }

  .q-docs-section__actions {
    flex: 0 0 auto;
  }

  :global(.q-docs-section__code-dialog) {
    max-width: 75vw;
  }
</style>
