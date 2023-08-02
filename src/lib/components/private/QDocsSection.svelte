<script>
  import { QDialog } from "$lib";
  import QCodeBlock from "../codeBlock/QCodeBlock.svelte";

  export let title, snippets;

  let dialog = false;
</script>

<div style="margin-bottom:48px">
  <div class="flex between-align q-mb-md">
    <h5>{title}</h5>
    {#if snippets}
      <QDialog
        class="snippet-dialog"
        bind:value={dialog}
        btnAttrs={{ outline: true, icon: "code", class: "circle" }}
        on:btnActivated={() => (dialog = true)}
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
