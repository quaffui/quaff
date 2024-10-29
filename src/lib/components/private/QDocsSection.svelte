<script lang="ts">
  import { QCodeBlock, QDialog, QBtn } from "$lib";
  import type { Snippet } from "svelte";

  let {
    title,
    snippet,
    children,
  }: {
    title: string;
    snippet?: string;
    children?: Snippet;
  } = $props();

  let dialog = $state(false);

  const code = $derived(snippet?.replaceAll(/^ {2}/gm, ""));
</script>

<div style="margin-bottom:48px">
  <div class="flex justify-between q-mb-md">
    <h5>{title}</h5>
    {#if code}
      <QBtn icon="code" variant="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal>
        <QCodeBlock {code} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>
  {@render children?.()}
</div>
