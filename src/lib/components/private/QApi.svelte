<script lang="ts">
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
  import { capitalize } from "$lib/utils";
  import Types from "$lib/utils/types.json";
  import type {
    QComponentDocs,
    QComponentProp,
    QComponentSlot,
    QComponentType,
    QComponentEvent,
  } from "$lib/utils";

  export let componentDocs: QComponentDocs[];

  let api: (keyof QComponentDocs["docs"])[] = componentDocs.map(() => "props");
  let drawer = Object.fromEntries(
    componentDocs.map((doc) => [
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

  function handleDrawer(QDocument: QComponentDocs, doc: QComponentProp, e: Event) {
    e.stopPropagation();
    let content = getType(doc.type);
    for (let docName in drawer[QDocument.name]) {
      if (drawer[QDocument.name][docName] && docName !== doc.name) {
        drawer[QDocument.name][docName] = false;
      }
    }

    if (!drawer[QDocument.name][doc.name]) {
      setTimeout(() => {
        drawerContent = content;
        drawer[QDocument.name][doc.name] = true;
      }, 100);
    } else {
      drawer[QDocument.name][doc.name] = false;
    }
  }
</script>

{#each componentDocs as QDocument, index}
  <QCard class="q-px-none q-pb-none q-mt-lg">
    <div class="flex justify-between items-center q-px-md">
      <h5 class="no-margin">
        <QIcon name="info" />
        <span class="q-ml-md">{QDocument.name} API</span>
      </h5>
      <QTabs bind:value={api[index]} class="no-margin">
        {#each Object.entries(QDocument.docs) as [tabName, _tabDoc]}
          {#if _tabDoc.length !== 0}
            <QTab name={tabName} style="min-width: 100px">
              <h6 style="margin: 0">{capitalize(tabName)}</h6>
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
                class="no-padding api-drawer"
                style="height: fit-content; max-height: 400%; overflow: auto; border-radius: 0;"
                bind:value={drawer[QDocument.name][doc.name]}
                width="50%"
              >
                <QCodeBlock language="ts" code={drawerContent} />
              </QDrawer>
            {/if}
            <QItemSection type="content" style="overflow: visible">
              {#snippet headline()}
                <div class="q-my-sm" style="flex: 1 1 0; white-space: nowrap">
                  <span class="q-pa-sm surface-variant">
                    <b>{doc.name}</b>
                    {#if isProp(doc, index)}
                      {doc.optional ? "?" : ""}
                      {#if doc.clickableType}
                        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                        <span
                          class="prop-type clickable"
                          on:click={(e) => isProp(doc, index) && handleDrawer(QDocument, doc, e)}
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
              {/snippet}
              {#snippet line1()}
                <div class="q-mt-sm prop-description" style="white-space: normal;">
                  {@html doc.description}
                </div>
              {/snippet}
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

  .prop-type {
    opacity: 0.75;

    &.clickable {
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }

  :global(.q-drawer.api-drawer pre) {
    margin: 0;
    border-radius: inherit;
    white-space: pre-wrap;
  }

  :global(.prop-description > a:hover) {
    color: var(--primary);
  }
</style>
