<script lang="ts" module>
  import { QContext } from "$lib/utils";

  interface Props {
    children?: Snippet;
    display?: Snippet;
    pre?: Snippet;
    usage?: Snippet;
    snippets?: Record<string, string>;
    componentDocs?: QComponentDocs | QComponentDocs[];
    docName?: string;
    docDescription?: string;
  }

  export const docsCtx = QContext<{ readonly snippets: Props["snippets"] }>("QDocs");
</script>

<script lang="ts">
  import { QCard, QCardSection, QTheme, Quaff } from "$lib";
  import { QColors, type QComponentDocs } from "$utils";
  import QApi from "./QApi.svelte";
  import type { Snippet } from "svelte";

  // #region:    --- Props
  let { children, display, pre, usage, snippets, componentDocs, docName, docDescription }: Props =
    $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let principalDocument = Array.isArray(componentDocs) ? componentDocs[0] : componentDocs;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const isDark = $derived(Quaff.darkMode.isActive);

  const hueRotate = $derived(
    QColors.calculateHueRotate(
      "#ec6b08",
      QTheme.themeColors[`primary-${isDark ? "dark" : "light"}`]
    )
  );

  const brightness = $derived(Quaff.darkMode.isActive ? 0.7 : 1.2);
  // #endregion: --- Derived values

  // #region:    --- Context
  docsCtx.set({ snippets });
  // #endregion: --- Context
</script>

<div
  class="q-docs"
  style="padding: 1rem; --q-hue-rotate: {hueRotate}deg; --q-brightness: {brightness}; max-width: {Quaff
    .breakpoints.lg}px; margin: auto;"
>
  <div class="row q-gutter-lg" style="min-height: 400px">
    <QCard
      class="col-sm-12 col-xs-12 col-lg-6"
      fill="primary"
      style="min-height: 400px; align-content: center;"
    >
      <h1
        class={[
          "no-margin justify-center",
          Quaff.breakpoints.isMoreThan("sm", true) ? "large" : "small",
        ]}
      >
        {docName || principalDocument?.name}
      </h1>
      <QCardSection class="q-docs__description flex flex-center">
        <h3 class="q-docs__description-text">
          {docDescription || principalDocument?.description}
        </h3>
      </QCardSection>
    </QCard>
    <QCard
      class="q-docs__preview col-sm-12 col-xs-12 col-lg-6 q-mt-none q-pa-none"
      fill="secondary"
      style="min-height: 400px"
    >
      <QCardSection class="q-pa-none">
        <div
          class="flex flex-center column"
          style="position: absolute; height: 100%; width: 100%; z-index: 1; overflow: hidden;"
        >
          {@render display?.()}
        </div>
        <img
          class="q-docs__image"
          src="/cocktail-close-up.jpg"
          alt="Close-up of the content of a cocktail"
        />
      </QCardSection>
    </QCard>
  </div>

  <div class="q-page">
    {#if componentDocs}
      <QApi componentDocs={Array.isArray(componentDocs) ? componentDocs : [componentDocs]} />
    {/if}

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
      height: 25rem;
      object-fit: cover;
      filter: hue-rotate(var(--q-hue-rotate)) brightness(var(--q-brightness));
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
      text-align: center;
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
