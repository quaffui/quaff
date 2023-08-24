<script lang="ts">
  import { Quaff } from "$lib/stores";
  import { QCard, QCardSection } from "$lib";
  import QApi from "./QApi.svelte";
  import type { QComponentDocs } from "$lib/utils";

  export let QComponentDocs: QComponentDocs | QComponentDocs[];

  $: isDark = $Quaff.dark.isActive;

  let principalDocument = Array.isArray(QComponentDocs) ? QComponentDocs[0] : QComponentDocs;
</script>

<div class="q-docs" style="margin: 1rem">
  <div class="row q-gutter-lg q-mb-lg" style="min-height: 400px">
    <QCard class="col-sm-12 col-lg-6 flex flex-center" fill="primary" style="min-height: 400px">
      <h1 class="large no-margin" slot="title">{principalDocument.name}</h1>
    </QCard>
    <QCard
      class="q-docs__preview col-sm-12 col-lg-6 q-mt-none q-pa-none"
      fill="secondary"
      style="min-height: 400px"
    >
      <QCardSection class="q-pa-none">
        <div
          class="flex flex-center"
          style="position: absolute; height: 100%; width: 100%; z-index: 1;"
        >
          <slot name="display" />
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

  <QApi QComponentDocs={Array.isArray(QComponentDocs) ? QComponentDocs : [QComponentDocs]} />

  {#if $$slots.usage}
    <div class="s12 q-pa-md">
      <div class="heading-usage">
        <h4 class="q-my-xl">Usage</h4>
      </div>

      <slot name="usage" />
    </div>
  {/if}

  <slot />
</div>

<style lang="scss">
  .q-docs {
    :global(.q-pa-none) {
      padding: 0 !important;
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
  }

  .prop-type {
    opacity: 0.75;

    &.clickable {
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }

  .heading-usage {
    display: flex;
    align-items: center;
  }
</style>
