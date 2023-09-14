<script>
  import { QCodeBlock, QDialog } from "$lib";

  export let title, snippets;

  let dialog = false;
</script>

<div style="margin-bottom:48px">
  <div class="flex justify-between q-mb-md">
    <h5>{title}</h5>
    {#if snippets}
      <QDialog
        class="snippet-dialog"
        bind:value={dialog}
        btnAttrs={{ outline: true, round: true, icon: "code" }}
        on:buttonClick={() => (dialog = true)}
        modal
      >
        <QCodeBlock code={snippets[title]} language="svelte" {title} copiable />
      </QDialog>
    {/if}
  </div>
  <slot />
</div>

<style>
  pre {
    max-height: 400px;
  }
</style>
