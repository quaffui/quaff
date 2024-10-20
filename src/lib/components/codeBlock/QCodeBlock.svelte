<script lang="ts">
  import { onMount } from "svelte";
  import { copy } from "$lib/utils";
  import { QBtn } from "$lib";
  import type { CodeToHastOptions, BundledLanguage, BundledTheme } from "shiki";
  import type { QCodeBlockProps } from "./props";

  let {
    language,
    theme = "github-dark-default",
    code = "/* No code found */",
    title = undefined,
    copiable = undefined,
  }: QCodeBlockProps = $props();

  let btnContent = $state("Copy");
  let btnColor = $state("primary");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let codeToHtml = async (str: string, opts: CodeToHastOptions<BundledLanguage, BundledTheme>) =>
    "";

  async function loadShiki() {
    try {
      // prevent vite "optimization", which would lead to errors here
      const shikiPackage = "shiki";
      const { codeToHtml: codeToHtmlShiki } = await import(/* @vite-ignore */ shikiPackage);
      codeToHtml = codeToHtmlShiki;
    } catch (e) {
      console.error("error loading shiki, please make sure it is installed", e);
    }
  }

  const html = $derived.by(
    async () =>
      await codeToHtml(code, {
        lang: language,
        theme,
      })
  );

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
    await copy(code).catch(() => {
      setBtn("error");
      setTimeout(() => setBtn("base"), 3000);
    });

    setBtn("success");
    setTimeout(() => {
      setBtn("base");
    }, 3000);
  }

  onMount(() => loadShiki());
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
        onclick={copyCode}
      >
        {btnContent}
      </QBtn>
    </div>
  {:else if title}
    <h4>{title}</h4>
  {/if}
  {#await html}
    <!-- waiting -->
  {:then htmlContent}
    {@html htmlContent}
  {:catch error}
    <pre>An error occurred: {error}</pre>
    <!-- error -->
  {/await}
</div>

<style>
  .q-code-block {
    border-radius: 0.5em;

    :global(pre) {
      white-space: break-spaces;
    }
  }
</style>
