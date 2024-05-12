<script lang="ts">
  import Highlight from "svelte-highlight";
  import { HighlightSvelte } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import "svelte-highlight/styles/material.css";
  import { copy } from "$lib/utils";
  import { QBtn } from "$lib";
  import type { QCodeBlockProps } from "./props";

  export let language: QCodeBlockProps["language"],
    code: QCodeBlockProps["code"] = "/* No code found */",
    title: QCodeBlockProps["title"] = undefined,
    copiable: QCodeBlockProps["copiable"] = undefined;

  let btnContent = "Copy";
  let btnColor = "primary";

  function setBtn(type: "base" | "error" | "success") {
    switch (type) {
      case "error":
        btnContent = "Error while copying...";
        btnColor = "error";
        break;
      case "success":
        btnContent = "Copied!";
        btnColor = "green";
        break;
      default:
        btnContent = "Copy";
        btnColor = "primary";
        break;
    }
  }

  async function copyCode() {
    await copy(code!).catch(() => {
      setBtn("error");
      setTimeout(() => setBtn("base"), 3000);
    });

    setBtn("success");
    setTimeout(() => {
      setBtn("base");
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
        design="outlined"
        on:click={copyCode}
      >
        {btnContent}
      </QBtn>
    </div>
  {:else if title}
    <h4>{title}</h4>
  {/if}
  {#if language === "ts"}
    <Highlight language={typescript} {code} />
  {:else}
    <HighlightSvelte {code} />
  {/if}
</div>

<style>
  .q-code-block {
    border-radius: 0.5em;
  }
</style>
