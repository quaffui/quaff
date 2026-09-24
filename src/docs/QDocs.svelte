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
  <div class="q-docs__hero row q-gutter-lg" style="min-height: 400px">
    <QCard
      class="q-docs__heading primary-container col-sm-12 col-xs-12 col-lg-6"
      style="min-height: 400px; align-content: center;"
    >
      <h1 class={["justify-center", Quaff.breakpoints.isMoreThan("sm", true) ? "large" : "small"]}>
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
      fill="primary"
      style="min-height: 400px; --q-docs-heading-color: {QTheme.themeColors.primaryLight};"
    >
      <div
        class="q-docs__art"
        aria-hidden="true"
        style:animation-play-state={isBackgroundPaused ? "paused" : "running"}
      >
        <span class="q-docs__citrus"></span>
        <span class="q-docs__bubbles"></span>
      </div>

      <QCardSection
        class="flex flex-center column q-pa-lg"
        style="position: absolute; height: 100%; width: 100%; z-index: 1; overflow: hidden;"
      >
        {@render display?.()}
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
      padding: 16px;

      h1 {
        overflow-wrap: anywhere;
        text-align: center;
      }
    }

    :global(.q-docs__preview) {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      padding-bottom: 48px;
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
        width: min(208px, 40%);
        aspect-ratio: 13 / 11;
        opacity: 0.45;
        border: 2px solid #8ceeff66;
        border-radius: 32% 40% 30% 35%;
        background: linear-gradient(145deg, #28e4df55, #007cff22);
        box-shadow: inset 12px 8px 0 #72e9ff22;
        animation: heading-drift 18s ease-in-out infinite alternate;
        animation-play-state: inherit;
      }

      &::before {
        inset-block-start: -64px;
        inset-inline-start: -80px;
        rotate: 25deg;
        animation-delay: -5s;
      }

      &::after {
        inset-block-end: -72px;
        inset-inline-end: -48px;
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
      width: 112px;
      height: 56px;
      inset-block-end: -40px;
      inset-inline-start: 24px;
      border: 3px solid #ffe7a0;
      border-radius: 0 0 112px 112px;
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
        radial-gradient(circle at 12% 72%, transparent 7px, #70e9ff77 8px 9px, transparent 10px),
        radial-gradient(circle at 7% 85%, #59dfff66 3px, transparent 4px),
        radial-gradient(circle at 88% 28%, transparent 5px, #70e9ff66 6px 7px, transparent 8px),
        radial-gradient(circle at 80% 16%, #59dfff66 2px, transparent 3px);
      animation-duration: 14s;
      animation-delay: -4s;
    }

    :global(.q-docs__motion) {
      position: absolute;
      inset-inline-end: 8px;
      inset-block-end: 8px;
      z-index: 2;
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
      padding: 4px 8px;
      border-radius: 4px;
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
      padding-top: 8px;
    }
  }

  @keyframes heading-drift {
    from {
      transform: translate(0, -8px) rotate(-4deg);
    }

    to {
      transform: translate(12px, 12px) rotate(5deg);
    }
  }

  .heading-usage {
    display: flex;
    align-items: center;
  }
</style>
