<script lang="ts" module>
  import { QContext } from "$lib/utils";

  interface Props {
    children?: Snippet;
    display?: Snippet;
    pre?: Snippet;
    usage?: Snippet;
    docName?: string;
    docDescription?: string;
  }

  interface DocsContext {
    readonly componentDocs: QComponentDocs | QComponentDocs[];
    readonly snippets: Record<string, string> | (() => Record<string, string>);
  }

  export const docsCtx = QContext<DocsContext>("QDocs");
</script>

<script lang="ts">
  import { QCard, QCardSection, QIconBtn, QTheme, Quaff } from "$lib";
  import { QColors } from "$utils";
  import type { QComponentDocs } from "$docs";
  import QApi from "./QApi.svelte";
  import type { Snippet } from "svelte";

  // #region:    --- Props
  let { children, display, pre, usage, docName, docDescription }: Props = $props();
  // #endregion: --- Props

  // #region:    --- Context
  const { componentDocs } = docsCtx.get() || { componentDocs: undefined };
  // #endregion: --- Context

  // #region:    --- Non-reactive variables
  let principalDocument = Array.isArray(componentDocs) ? componentDocs[0] : componentDocs;
  // #endregion: --- Non-reactive variables

  // #region:    --- State
  let isBackgroundPaused = $state(false);
  // #endregion: --- State

  // #region:    --- Derived values
  const isDark = $derived(Quaff.darkMode.isActive);

  const hueRotate = $derived(
    QColors.calculateHueRotate("#ec6b08", QTheme.themeColors[`primary${isDark ? "Dark" : "Light"}`])
  );

  const brightness = $derived(isDark ? 0.7 : 1.2);
  // #endregion: --- Derived values
</script>

<div
  class="q-docs"
  style="--q-hue-rotate: {hueRotate}deg; --q-brightness: {brightness}; max-width: {Quaff.breakpoints
    .lg}px; width: 100%; margin-inline: auto;"
>
  <div class="q-docs__hero row q-gutter-lg" style="min-height: 25rem">
    <QCard
      class="q-docs__heading col-sm-12 col-xs-12 col-lg-6"
      fill="primary"
      style="--q-docs-heading-color: {QTheme.themeColors
        .primaryLight}; min-height: 25rem; align-content: center;"
    >
      <div
        class="q-docs__art"
        aria-hidden="true"
        style:animation-play-state={isBackgroundPaused ? "paused" : "running"}
      >
        <span class="q-docs__citrus"></span>
        <span class="q-docs__bubbles"></span>
      </div>
      <h1 class={["justify-center", Quaff.breakpoints.isMoreThan("sm", true) ? "large" : "small"]}>
        {docName || principalDocument?.name}
      </h1>
      <QCardSection class="q-docs__description flex flex-center">
        <h3 class="q-docs__description-text">
          {docDescription || principalDocument?.description}
        </h3>
      </QCardSection>
      <QIconBtn
        class="q-docs__motion"
        icon={isBackgroundPaused ? "play_arrow" : "pause"}
        aria-label={isBackgroundPaused ? "Play background animation" : "Pause background animation"}
        color="inherit"
        expressive={false}
        onclick={() => (isBackgroundPaused = !isBackgroundPaused)}
      />
    </QCard>
    <QCard
      class="q-docs__preview col-sm-12 col-xs-12 col-lg-6 q-mt-none q-pa-none"
      fill="secondary"
      style="min-height: 25rem"
    >
      <QCardSection class="q-pa-none">
        <div
          class="flex flex-center column q-pa-lg"
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
      <QApi />
    {/if}

    {@render pre?.()}

    {#if usage}
      <div>
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
    &__hero {
      padding: 1rem;

      h1 {
        overflow-wrap: anywhere;
        text-align: center;
      }
    }

    :global(.q-docs__heading) {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      padding-bottom: 3rem;
      color: #f4f9ff;
      background: linear-gradient(
        135deg,
        var(--q-docs-heading-color),
        color-mix(in srgb, var(--q-docs-heading-color) 85%, #001a70)
      );
    }

    &__art {
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;

      &::before,
      &::after {
        content: "";
        position: absolute;
        width: min(13rem, 40%);
        aspect-ratio: 13 / 11;
        opacity: 0.45;
        border: 0.125rem solid #8ceeff66;
        border-radius: 32% 40% 30% 35%;
        background: linear-gradient(145deg, #28e4df55, #007cff22);
        box-shadow: inset 0.75rem 0.5rem 0 #72e9ff22;
        animation: heading-drift 18s ease-in-out infinite alternate;
        animation-play-state: inherit;
      }

      &::before {
        inset-block-start: -4rem;
        inset-inline-start: -5rem;
        rotate: 25deg;
        animation-delay: -5s;
      }

      &::after {
        inset-block-end: -4.5rem;
        inset-inline-end: -3rem;
        rotate: -20deg;
        animation-delay: -14s;
        animation-direction: alternate-reverse;
      }
    }

    &__citrus,
    &__bubbles {
      position: absolute;
      animation: heading-drift 22s ease-in-out infinite alternate;
      animation-play-state: inherit;
    }

    &__citrus {
      width: 7rem;
      height: 3.5rem;
      inset-block-end: -2.5rem;
      inset-inline-start: 1.5rem;
      border: 0.1875rem solid #ffe7a0;
      border-radius: 0 0 7rem 7rem;
      background: repeating-conic-gradient(
        from 90deg at 50% 0,
        #ffb94a 0deg 27deg,
        #ffe7a0 27deg 30deg
      );
      rotate: 15deg;
      animation-delay: -8s;
    }

    &__bubbles {
      inset: 0;
      opacity: 0.6;
      background:
        radial-gradient(
          circle at 12% 72%,
          transparent 0.4375rem,
          #70e9ff77 0.5rem 0.5625rem,
          transparent 0.625rem
        ),
        radial-gradient(circle at 7% 85%, #59dfff66 0.1875rem, transparent 0.25rem),
        radial-gradient(
          circle at 88% 28%,
          transparent 0.3125rem,
          #70e9ff66 0.375rem 0.4375rem,
          transparent 0.5rem
        ),
        radial-gradient(circle at 80% 16%, #59dfff66 0.125rem, transparent 0.1875rem);
      animation-duration: 14s;
      animation-delay: -4s;
    }

    :global(.q-docs__motion) {
      position: absolute;
      inset-inline-end: 0.5rem;
      inset-block-end: 0.5rem;
    }

    :global(.q-docs__motion:focus-visible) {
      outline-color: currentColor;
    }

    @media (prefers-reduced-motion: reduce) {
      &__art::before,
      &__art::after,
      &__citrus,
      &__bubbles {
        animation: none;
      }

      :global(.q-docs__motion) {
        display: none;
      }
    }

    @media (forced-colors: active) {
      :global(.q-docs__heading) {
        color: CanvasText;
        background: Canvas;
      }

      &__art,
      :global(.q-docs__motion) {
        display: none;
      }
    }

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

  @keyframes heading-drift {
    from {
      transform: translate(0, -0.5rem) rotate(-4deg);
    }

    to {
      transform: translate(0.75rem, 0.75rem) rotate(5deg);
    }
  }

  .heading-usage {
    display: flex;
    align-items: center;
  }
</style>
