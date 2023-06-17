<script lang="ts">
  import { capitalize } from "$lib/utils/string";
  import type {
    QComponentDocs,
    QComponentProp,
    QComponentSlot,
    QComponentType,
    QComponentEvent,
  } from "$lib/utils/types";
  import {
    QCard,
    QIcon,
    QTabs,
    QTab,
    QSeparator,
    QCardSection,
    QList,
    QItem,
    QItemSection,
  } from "$lib";

  export let QComponentDocs: QComponentDocs[];

  let api: (keyof QComponentDocs["docs"])[] = QComponentDocs.map((doc) => "props");

  function isProp(
    doc: QComponentProp | QComponentSlot | QComponentType | QComponentEvent,
    index: number
  ): doc is QComponentProp {
    return api[index] === "props";
  }
  function isEvent(
    doc: QComponentProp | QComponentSlot | QComponentType | QComponentEvent,
    index: number
  ): doc is QComponentEvent {
    return api[index] === "events";
  }
</script>

{#each QComponentDocs as apiDocument, index}
  <QCard class="q-px-none q-pb-none">
    <div slot="title" class="flex between-align middle-align q-px-md">
      <h5>
        <QIcon name="info" />
        <span class="q-ml-md">{apiDocument.name} API</span>
      </h5>
      <QTabs bind:value={api[index]} class="no-margin">
        {#each Object.entries(apiDocument.docs) as [tabName, _tabDoc]}
          {#if _tabDoc.length !== 0}
            <QTab name={tabName} style="min-width: 100px">
              <h6>{capitalize(tabName)}</h6>
            </QTab>
          {/if}
        {/each}
      </QTabs>
    </div>
    <QSeparator />
    <QCardSection>
      <QList separator>
        {#each apiDocument.docs[api[index]] as doc}
          <QItem>
            <QItemSection>
              <span class="small-padding surface-variant small-round">
                <b>{doc.name}</b>
                {#if isProp(doc, index)}
                  {#if doc.clickableType === true}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span class="prop-type clickable" on:click={() => (api[index] = "types")}>
                      {doc.optional ? "?" : ""}: {doc.type} = {doc.default}
                    </span>
                  {:else}
                    <span class="prop-type">
                      {doc.optional ? "?" : ""}: {doc.type} = {doc.default}
                    </span>
                  {/if}
                {:else if isEvent(doc, index)}
                  <span class="prop-type">
                    : {doc.type}
                  </span>
                {/if}
              </span>
            </QItemSection>
            <QItemSection>{doc.description}</QItemSection>
          </QItem>
        {/each}
      </QList>
    </QCardSection>
  </QCard>
{/each}
