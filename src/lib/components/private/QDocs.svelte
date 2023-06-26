<script lang="ts">
  import { QCard, QCardSection } from "$lib";
  import type { QComponentDocs } from "$utils/types";
  import QApi from "./QApi.svelte";

  export let QComponentDocs: QComponentDocs | QComponentDocs[];

  let principalDocument = Array.isArray(QComponentDocs) ? QComponentDocs[0] : QComponentDocs;
</script>

<div style="margin: 1rem">
  <div class="grid" style="min-height: 400px">
    <QCard class="s12 l6 flex center-align primary-container">
      <h1 class="large" slot="title">{principalDocument.name}</h1>
    </QCard>
    <QCard class="s12 l6 q-mt-none q-pa-none secondary-container">
      <QCardSection class="no-padding">
        <div
          class="flex center-align middle-align"
          style="position: absolute; height: 100%; width: 100%; z-index: 1;"
        >
          <slot name="display" />
        </div>
        <img
          class="responsive medium"
          src="/beer-splash.jpeg"
          alt=""
          style="filter:brightness(0.3)"
        />
      </QCardSection>
      <QCardSection class="flex center-align middle-align">
        <h3 class="small">
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
