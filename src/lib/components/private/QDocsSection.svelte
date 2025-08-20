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

  // #region:    --- Props
  let { title, noCode = false, sectionDescription, children }: QDocsSectionProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let dialog = $state(false);

  const ctx = docsCtx.get();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const code = $derived(ctx?.snippets?.[title]);

  // Create a kebab-case id from the title to be able to link to this section
  const id = $derived(title.toLowerCase().replaceAll(" ", "-"));
  // #endregion: --- Derived values
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
