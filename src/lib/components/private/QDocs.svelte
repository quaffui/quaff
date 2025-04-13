<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { QCard, QCardSection } from "$lib";
  import type { QComponentDocs } from "$lib/utils";
  import Quaff from "$lib/classes/Quaff.svelte";
  import QApi from "./QApi.svelte";

  let {
    children,
    display,
    pre,
    usage,
    snippets,
    componentDocs,
  }: {
    children?: Snippet;
    display?: Snippet;
    pre?: Snippet;
    usage?: Snippet;
    snippets?: Record<string, string>;
    componentDocs: QComponentDocs | QComponentDocs[];
  } = $props();

  const isDark = $derived(Quaff.darkMode.isActive);

  setContext("QDocsSnippets", () => snippets);

  let principalDocument = Array.isArray(componentDocs) ? componentDocs[0] : componentDocs;
</script>

<div class="q-docs" style="padding: 1rem">
  <div class="row q-gutter-lg" style="min-height: 400px">
    <QCard class="col-sm-12 col-lg-6 flex flex-center" fill="primary" style="min-height: 400px">
      <h1 class="large no-margin">{principalDocument.name}</h1>
    </QCard>
    <QCard
      class="q-docs__preview col-sm-12 col-lg-6 q-mt-none q-pa-none"
      fill="secondary"
      style="min-height: 400px"
    >
      <QCardSection class="q-pa-none">
        <div
          class="flex flex-center"
          style="position: absolute; height: 100%; width: 100%; z-index: 1; overflow: hidden;"
        >
          {@render display?.()}
        </div>
        <img
          class="q-docs__image"
          src="/beer-splash-{isDark ? 'dark' : 'light'}.jpg"
          alt="Close-up of the content of a glass of beer"
          style={isDark ? "filter:brightness(0.3)" : ""}
        />
      </QCardSection>
      <QCardSection class="q-docs__description flex flex-center">
        <h3 class="q-docs__description-text">
          {principalDocument.description}
        </h3>
      </QCardSection>
    </QCard>
  </div>

  <div class="q-page">
    <QApi componentDocs={Array.isArray(componentDocs) ? componentDocs : [componentDocs]} />

    {@render pre?.()}

    {#if usage}
      <div class="q-pa-md">
        <div class="heading-usage">
          <h4 class="q-my-xl">Usage</h4>
        </div>

        {@render usage()}
      </div>
    {/if}

    {@render children?.()}
  </div>
</div>

<style lang="scss">
  .q-docs {
    :global(.q-pa-none) {
      padding: 0 !important;
    }

    :global(code:not(pre > code)) {
      background-color: var(--surface-container);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    &__image {
      width: 100%;
      height: 12rem;
      object-fit: cover;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    :global(.q-docs__preview) {
      display: flex !important;
      flex-direction: column;
    }

    :global(.q-docs__description) {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
    }

    :global(.q-docs__description-text) {
      font-size: 1.75rem;
    }

    .q-page {
      padding-top: 0.5rem;
    }
  }

  .heading-usage {
    display: flex;
    align-items: center;
  }
</style>
