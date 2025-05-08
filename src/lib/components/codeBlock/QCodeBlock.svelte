<script lang="ts">
  import { QBtn, Quaff } from "$lib";
  import { copy } from "$utils";
  import type { QCodeBlockProps } from "./props";

  let {
    language,
    lightTheme = "github-light-default",
    darkTheme = "github-dark-default",
    code = "/* No code found */",
    title,
    copiable,
    ...props
  }: QCodeBlockProps = $props();

  let btnContent = $state("Copy");
  let btnColor = $state("primary");

  let html = $state("");

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    Quaff.darkMode.isActive;

    // This is required to have the html updated when the code changes
    getHtml(code);
  });

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

  async function getHtml(code: string) {
    try {
      const { codeToHtml } = await import("shiki");

      html = await codeToHtml(code, {
        lang: language,
        theme: Quaff.darkMode.isActive ? darkTheme : lightTheme,
      });
    } catch {
      console.error("Error while loading shiki, make sure it is installed");
      html = `<pre>${code}</pre>`;
    }
  }
</script>

<div {...props} class="q-code-block" data-quaff>
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
      overflow: auto;
    }
  }
</style>
