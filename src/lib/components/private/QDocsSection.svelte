<script lang="ts">
  import { QCodeBlock, QDialog, QBtn } from "$lib";

  export let title: string,
    snippets: Record<string, string> | undefined = undefined;

  let dialog = false;
</script>

<div style="margin-bottom:48px">
  <div class="flex justify-between q-mb-md">
    <h5>{title}</h5>
    {#if snippets}
      <QBtn icon="code" design="outlined" round onclick={() => (dialog = true)} />
      <QDialog class="snippet-dialog" bind:value={dialog} modal>
        <QCodeBlock code={snippets[title]} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>
  <slot />
</div>
