<script lang="ts">
  import { capitalize } from "$lib/utils/string";
  import {
    QCard,
    QCardSection,
    QIcon,
    QTabs,
    QTab,
    QSeparator,
    QList,
    QItem,
    QItemSection,
  } from "$lib";
  import type {
    QComponentDocs,
    QComponentProp,
    QComponentSlot,
    QComponentType,
  } from "$utils/types";

  export let QComponentDocs: QComponentDocs;

  let api: keyof QComponentDocs["docs"] = "props";

  function isProp(doc: QComponentProp | QComponentSlot | QComponentType): doc is QComponentProp {
    return api === "props";
  }
</script>

<div style="margin: 1rem">
  <div class="grid" style="min-height: 400px">
    <QCard class="s6 flex center-align primary-container">
      <h1 class="large" slot="title">{QComponentDocs.name}</h1>
    </QCard>
    <QCard class="s6 q-mt-none q-pa-none secondary-container">
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
          {QComponentDocs.description}
        </h3>
      </QCardSection>
    </QCard>
  </div>
  <QCard class="q-px-none q-pb-none">
    <div slot="title" class="flex between-align middle-align q-px-md">
      <h5>
        <QIcon name="info" />
        <span class="q-ml-md">{QComponentDocs.name} API</span>
      </h5>
      <QTabs bind:value={api} class="no-margin">
        {#each Object.entries(QComponentDocs.docs) as [tabName, _tabDoc]}
          {#if _tabDoc !== undefined}
            <QTab name={tabName}>
              <h6>{capitalize(tabName)}</h6>
            </QTab>
          {/if}
        {/each}
      </QTabs>
    </div>
    <QSeparator />
    <QCardSection>
      <QList separator>
        {#each QComponentDocs.docs[api] as doc}
          <QItem>
            <QItemSection>
              <span class="small-padding surface-variant small-round">
                <b>{doc.name}</b>
                {#if isProp(doc)}
                  {#if doc.clickableType === true}
                    <span class="prop-type clickable" on:click={() => (api = "types")}>
                      {doc.optional ? "?" : ""}: {doc.type} = {doc.default}
                    </span>
                  {:else}
                    <span class="prop-type">
                      {doc.optional ? "?" : ""}: {doc.type} = {doc.default}
                    </span>
                  {/if}
                {/if}
              </span>
            </QItemSection>
            <QItemSection>{doc.description}</QItemSection>
          </QItem>
        {/each}
      </QList>
    </QCardSection>
  </QCard>
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
</style>
