<script lang="ts">
  import { QCodeBlock, QDialog, QBtn } from "$lib";
  import type { Snippet } from "svelte";

  let {
    title,
    snippets,
    children,
  }: {
    title: string;
    snippets?: Record<string, string>;
    children?: Snippet;
  } = $props();

  let dialog = $state(false);

  const code = $derived(snippets?.[title].replaceAll(/^  /gm, ""));
</script>

<div style="margin-bottom:48px">
  <div class="flex justify-between q-mb-md">
    <h5>{title}</h5>
    {#if code}
      <QBtn icon="code" design="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal>
        <QCodeBlock {code} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>
  {@render children?.()}
</div>
