<script lang="ts">
  import {
    QAvatar,
    QCard,
    QCardSection,
    QIcon,
    QItem,
    QItemSection,
    QList,
    QSeparator,
    QTab,
    QTabs,
  } from "$lib";
  import { QAvatarDocs } from "$components/avatar/docs";
  import type { QAvatarProp, QAvatarSlot, QAvatarType } from "$components/avatar/docs";
  import { capitalize } from "$lib/utils/string";

  let api: keyof typeof QAvatarDocs.docs = "props";

  function isProp(doc: QAvatarProp | QAvatarSlot | QAvatarType): doc is QAvatarProp {
    return api === "props";
  }

  function isSlot(doc: QAvatarProp | QAvatarSlot | QAvatarType): doc is QAvatarSlot {
    return api === "props";
  }

  function isType(doc: QAvatarProp | QAvatarSlot | QAvatarType): doc is QAvatarType {
    return api === "props";
  }
</script>

<div style="margin: 1rem">
  <div class="grid" style="min-height: 400px">
    <QCard class="s6 flex center-align primary-container">
      <h1 class="large" slot="title">{QAvatarDocs.name}</h1>
    </QCard>
    <QCard class="s6 q-mt-none q-pa-none secondary-container">
      <QCardSection class="no-padding">
        <div
          class="flex center-align middle-align"
          style="position: absolute; height: 100%; width: 100%; z-index: 1;"
        >
          <QAvatar src="/cocktail.jpg" size="5rem" />
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
          {QAvatarDocs.description}
        </h3>
      </QCardSection>
    </QCard>
  </div>
  <QCard class="q-px-none q-pb-none">
    <div slot="title" class="flex between-align middle-align q-px-md">
      <h5>
        <QIcon name="info" />
        <span class="q-ml-md">{QAvatarDocs.name} API</span>
      </h5>
      <QTabs bind:value={api} class="no-margin">
        {#each Object.entries(QAvatarDocs.docs) as [tabName, _tabDoc]}
          <QTab name={tabName}>
            <h6>{capitalize(tabName)}</h6>
          </QTab>
        {/each}
      </QTabs>
    </div>
    <QSeparator />
    <QCardSection>
      <QList separator>
        {#each QAvatarDocs.docs[api] as doc}
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
