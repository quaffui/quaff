<script lang="ts">
  import { copy } from "$lib/utils";
  import { QBtn } from "$lib";
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

  const html = $derived.by(
    async () =>
      await (
        await import(/* @vite-ignore */ "shiki")
      ).codeToHtml(code, {
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
</script>

<div class="q-code-block" data-quaff>
  {#if copiable}
    <div class="flex justify-between {title ? 'items-center' : 'justify-end'} q-pb-sm">
      {#if title}
        <h4 class="q-ma-none q-pr-lg">{title}</h4>
      {/if}
      <QBtn
        class="border-{btnColor} text-{btnColor}"
        size="sm"
        icon="content_copy"
        variant="outlined"
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
    border-radius: inherit;

    :global(pre) {
      text-align: left;
      padding: 1rem;
    }
  }
</style>
