<script lang="ts">
  import { codeToHtml, type BundledTheme, type ThemeRegistration } from "shiki";
  import Quaff from "$classes/Quaff.svelte";
  import QBtn from "$components/button/QBtn.svelte";
  import { copy, escape } from "$utils";
  import { quaffShikiDarkTheme, quaffShikiLightTheme } from "$internal/shikiTheme";
  import type { QCodeBlockProps } from "./props";

  // #region:    --- Props
  let {
    language,
    theme = "quaff",
    code = "/* No code found */",
    title,
    copiable,
    ...props
  }: QCodeBlockProps = $props();
  // #endregion: --- Props

  const copyButtonStates = {
    base: { content: "Copy", color: "primary" },
    error: { content: "Error while copying...", color: "error" },
    success: { content: "Copied!", color: "green" },
  } as const;

  // #region:    --- Reactive variables
  let copyStatus = $state<keyof typeof copyButtonStates>("base");
  let html = $state("");

  const copyButton = $derived(copyButtonStates[copyStatus]);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const resolvedTheme = $derived.by(() => {
    if (typeof theme === "string" && theme !== "quaff") {
      return theme;
    }

    const suffix = Quaff.darkMode.isActive ? "dark" : "light";

    if (theme === "quaff") {
      return suffix === "dark" ? quaffShikiDarkTheme : quaffShikiLightTheme;
    }

    return theme[suffix];
  });
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    void updateHtml(code, language, resolvedTheme);
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  async function copyCode() {
    try {
      await copy(code);
      copyStatus = "success";
    } catch {
      copyStatus = "error";
    }

    setTimeout(() => {
      copyStatus = "base";
    }, 3000);
  }

  async function updateHtml(
    source: string,
    language: QCodeBlockProps["language"],
    resolvedTheme: BundledTheme | ThemeRegistration
  ) {
    try {
      html = await codeToHtml(source, {
        lang: language,
        theme: resolvedTheme,
      });
    } catch (error) {
      console.error("Error while highlighting code with Shiki", error);
      html = `<pre>${escape(source)}</pre>`;
    }
  }
  // #endregion: --- Functions
</script>

<div {...props} class="q-code-block" data-quaff>
  {#if copiable}
    <div
      class="q-code-block__title-section q-pb-sm"
      class:items-center={title}
      class:justify-between={title}
      class:justify-end={!title}
    >
      {#if title}
        <h4 class="q-ma-none">{title}</h4>
      {/if}
      <QBtn
        class="border-{copyButton.color} text-{copyButton.color}"
        size="sm"
        icon="content_copy"
        variant="outlined"
        onclick={copyCode}
      >
        {copyButton.content}
      </QBtn>
    </div>
  {:else if title}
    <h4>{title}</h4>
  {/if}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output; fallback source is escaped. -->
  {@html html}
</div>

<style lang="scss">
  @use "$css/mixins";

  .q-code-block {
    border-radius: inherit;

    :global(pre) {
      text-align: left;
      padding: 1rem;
      overflow: auto;
    }
  }

  .q-code-block__title-section {
    display: flex;
    gap: 0.5rem;
  }

  @include mixins.up-to-sm {
    :global(.q-dialog:has(.q-code-block__title-section)) {
      min-width: auto;
    }

    .q-code-block__title-section {
      flex-direction: column;
    }
  }
</style>
