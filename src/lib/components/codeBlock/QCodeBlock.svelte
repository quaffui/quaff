<script lang="ts">
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { copy } from "$lib/utils";
  import { QBtn } from "..";
  import type { QCodeBlockProps } from "./props";
  

  export let language: QCodeBlockProps["language"],
    code: QCodeBlockProps["code"] = "/* No code found */",
    title: QCodeBlockProps["title"] = undefined,
    copiable: QCodeBlockProps["copiable"] = undefined;

  let btnContent = "Copy";
  let btnColor = "primary";

  function setBtn(type: "base" | "error" | "success") {
    switch(type) {
      case "error":
        btnContent = "Error while copying..."
        btnColor = "error"
        break
      case "success":
        btnContent = "Copied!";
        btnColor = "green";
        break
      default:
        btnContent = "Copy";
        btnColor = "primary";
        break
    }
  }

  async function copyCode() {
    await copy(code!).catch((_) => {
      setBtn("error")
      setTimeout(() => setBtn("base"), 3000);
    })

    setBtn("success")
    setTimeout(() => {
      setBtn("base")
    }, 3000);
  }
</script>

<div class="q-code-block">
  {#if copiable}
    <div class="flex justify-between {title ? 'items-center' : 'justify-end'} q-pb-sm">
      {#if title}
        <h4 class="q-ma-none q-pr-lg">{title}</h4>
      {/if}
      <QBtn
        class="border-{btnColor} text-{btnColor}"
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
  <Highlight language={typescript} {code} />
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
