<script lang="ts">
  import { QSelect, type QuaffLanguage } from "$lib";
  import { initI18n } from "$internal/i18n.svelte";
  import enUS from "$lib/locales/en-US";
  import deDE from "$lib/locales/de-DE";
  import frFR from "$lib/locales/fr-FR";
  import esES from "$lib/locales/es-ES";
  import jaJP from "$lib/locales/ja-JP";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
  let locale = $state("en-US");
  const languages: Record<string, QuaffLanguage> = {
    "en-US": enUS,
    "de-DE": deDE,
    "fr-FR": frFR,
    "es-ES": esES,
    "ja-JP": jaJP,
  };
  const options = [
    { label: "English", value: "en-US" },
    { label: "Deutsch", value: "de-DE" },
    { label: "Français", value: "fr-FR" },
    { label: "Español", value: "es-ES" },
    { label: "日本語", value: "ja-JP" },
  ];

  initI18n({
    get language() {
      return languages[locale];
    },
  });
</script>

<QSelect
  bind:value={locale}
  {options}
  label="Language"
  emitValue
  outlined
  class="q-mb-lg"
  style="max-width: 20rem"
/>

<div lang={locale}>
  {@render children()}
</div>
