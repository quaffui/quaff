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
    QCardSection,
    QList,
    QItem,
    QItemSection,
    QDrawer,
    QCodeBlock,
  } from "$lib";
  import Types from "$utils/types.json";

  export let QComponentDocs: QComponentDocs[];

  let api: (keyof QComponentDocs["docs"])[] = QComponentDocs.map((_doc) => "props");
  let drawer = Object.fromEntries(
    QComponentDocs.map((doc) => [
      doc.name,
      Object.fromEntries(
        doc.docs.props.map((prop) => [prop.name, prop.clickableType ? false : undefined])
      ),
    ])
  );
  let drawerContent: string | undefined = "";

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

  function getType(type: string) {
    type = type.replace("[]", "");
    let found = type in Types ? Types[type as keyof typeof Types] : undefined;
    return found;
  }

  function handleDrawer(QDocument: QComponentDocs, doc: QComponentProp) {
    let content = getType(doc.type);
    if (!drawer[QDocument.name][doc.name]) {
      drawerContent = content;
      drawer[QDocument.name][doc.name] = true;
    } else {
      if (content !== drawerContent) {
        drawer[QDocument.name][doc.name] = false;
        setTimeout(() => {
          drawerContent = content;
          drawer[QDocument.name][doc.name] = true;
        }, 250);
      } else {
        drawer[QDocument.name][doc.name] = false;
      }
    }
  }
</script>

{#each QComponentDocs as QDocument, index}
  <QCard class="q-px-none q-pb-none">
    <div slot="title" class="flex between-align middle-align q-px-md">
      <h5 class="no-margin">
        <QIcon name="info" />
        <span class="q-ml-md">{QDocument.name} API</span>
      </h5>
      <QTabs bind:value={api[index]} class="no-margin">
        {#each Object.entries(QDocument.docs) as [tabName, _tabDoc]}
          {#if _tabDoc.length !== 0}
            <QTab name={tabName} style="min-width: 100px">
              <h6>{capitalize(tabName)}</h6>
            </QTab>
          {/if}
        {/each}
      </QTabs>
    </div>
    <QCardSection style="max-height: 416px; overflow-y: scroll">
      <QList separator bordered style="overflow:hidden">
        {#each QDocument.docs[api[index]] as doc}
          <QItem style="overflow: visible">
            {#if isProp(doc, index) && doc.clickableType}
              <QDrawer
                side="right"
                class="no-padding"
                style="height: fit-content; max-height: 400%; overflow: auto; border-radius: 0;"
                bind:value={drawer[QDocument.name][doc.name]}
                width="50%"
              >
                <QCodeBlock language="ts" code={drawerContent} />
              </QDrawer>
            {/if}
            <QItemSection type="content" style="overflow: visible">
              <div slot="headline" class="q-my-sm" style="flex: 1 1 0; white-space: nowrap">
                <span class=" small-padding surface-variant small-round">
                  <b>{doc.name}</b>
                  {#if isProp(doc, index)}
                    {doc.optional ? "?" : ""}
                    {#if doc.clickableType === true}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <span
                        class="prop-type clickable"
                        on:click={() => isProp(doc, index) && handleDrawer(QDocument, doc)}
                      >
                        : {doc.type}
                      </span>
                    {:else}
                      <span class="prop-type">
                        : {doc.type}
                      </span>
                    {/if}
                    {doc.default === "" ? "" : ` = ${doc.default}`}
                  {:else if isEvent(doc, index)}
                    <span class="prop-type">
                      : {doc.type}
                    </span>
                  {/if}
                </span>
              </div>
              <div slot="line1" class="q-mt-sm prop-description">{@html doc.description}</div>
            </QItemSection>
          </QItem>
        {/each}
      </QList>
    </QCardSection>
  </QCard>
{/each}

<style lang="scss">
  .clickable {
    cursor: pointer;
    &:hover {
      color: var(--primary);
    }
  }

  .q-item {
    overflow: visible;

    & > .q-drawer {
    }
  }

  pre[class*="language-"] {
    margin: 0;
    padding: 1em;
    border-radius: inherit;
  }

  :global(.prop-description > a:hover) {
    color: var(--primary);
  }
</style>
