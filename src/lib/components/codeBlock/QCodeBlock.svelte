<script lang="ts">
  import Prism from "prismjs";
  import "prismjs/themes/prism-twilight.css";
  import "prismjs/components/prism-typescript";
  import "prism-svelte";
  import type { QCodeBlockProps } from "./props";
  import { QBtn } from "$lib";

  export let language: QCodeBlockProps["language"],
    code: QCodeBlockProps["code"] = "/* No code found */",
    title: QCodeBlockProps["title"] = undefined,
    copiable: QCodeBlockProps["copiable"] = undefined;

  let btnContent = "Copy";
  let btnColor = "primary";

  $: highlighted = Prism.highlight(code!, Prism.languages[language], language);

  async function copyCode() {
    try {
      if (navigator.clipboard.write) {
        let blob = new Blob([code!], { type: "text/plain" });
        let item = new ClipboardItem({ "text/plain": blob });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(code!);
      }

      btnContent = "Copied!";
      btnColor = "green";
      setTimeout(() => {
        btnContent = "Copy";
        btnColor = "primary";
      }, 3000);
    } catch (e) {
      btnContent = "Error while copying...";
      btnColor = "error";
      setTimeout(() => {
        btnContent = "Copy";
        btnColor = "primary";
      }, 3000);
    }
  }
</script>

<div class="q-code-block">
  {#if copiable}
    <div class="flex between-align middle-align q-pb-sm">
      <h4 class="q-ma-none q-pr-lg">{title}</h4>
      <QBtn
        class="{btnColor}-border {btnColor}-text"
        size="sm"
        icon="content_copy"
        outline
        on:click={copyCode}
      >
        {btnContent}
      </QBtn>
    </div>
  {:else if title}
    <h4>{title}</h4>
  {/if}
  <pre class="language-svelte"><code>{@html highlighted}</code></pre>
</div>

<style>
  .q-code-block {
    border-radius: 0.5em;
  }

  pre {
    max-height: 400px;
    height: 100%;
    margin: 0;
  }

  code {
    white-space: pre-wrap;
  }
</style>
