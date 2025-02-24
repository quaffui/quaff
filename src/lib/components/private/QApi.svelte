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
    QCodeBlock,
  } from "$lib";
  import { capitalize } from "$lib/utils";
  import Types from "$lib/utils/types.json";
  import type { QComponentDocs, QComponentEvent, QComponentMethod } from "$lib/utils";
  import type {
    ParsedProp,
    ParsedSnippet,
    PropType,
    SnippetType,
  } from "$docgen/props/parseInterface";
  import QTooltip from "$components/tooltip/QTooltip.svelte";

  let { componentDocs }: { componentDocs: QComponentDocs[] } = $props();

  let api: (keyof QComponentDocs["docs"])[] = $state(componentDocs.map(() => "props"));

  function getType(type: string) {
    type = type.replace("[]", "");
    let found = type in Types ? Types[type as keyof typeof Types] : undefined;
    return found;
  }

  function isProp(
    doc: ParsedProp | ParsedSnippet | QComponentEvent | QComponentMethod,
    index: number
  ): doc is ParsedProp {
    return api[index] === "props";
  }

  function isEvent(
    doc: ParsedProp | ParsedSnippet | QComponentEvent | QComponentMethod,
    index: number
  ): doc is QComponentEvent {
    return api[index] === "events";
  }

  function isSnippet(
    doc: ParsedProp | ParsedSnippet | QComponentEvent | QComponentMethod,
    index: number
  ): doc is ParsedSnippet {
    return api[index] === "snippets";
  }

  function hasClickableTypes(doc: ParsedProp | ParsedSnippet) {
    return Array.isArray(doc.type) ? doc.type.some((t) => t.isClickable) : doc.type.isClickable;
  }
</script>

{#each componentDocs as QDocument, index}
  <QCard class="q-px-none q-pb-none q-mt-lg">
    <div class="flex justify-between items-center q-px-md">
      <h5 class="no-margin">
        <QIcon name="info" />
        <span class="q-ml-md">{QDocument.name} API</span>
      </h5>
      <QTabs bind:value={api[index]} noSeparator class="no-margin">
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
      <QList separator bordered style="overflow-x:hidden">
        {#each QDocument.docs[api[index]] as doc}
          <QItem>
            <QItemSection type="content">
              {#snippet headline()}
                <div class="q-my-sm" style="display: flex; flex: 1 1 0; white-space: pre">
                  <span class="surface-variant">
                    <b>{doc.name}</b>
                  </span>
                  {#if isProp(doc, index)}
                    {#if doc.optional}
                      <span class="prop-type">?</span>
                    {/if} :

                    {#if hasClickableTypes(doc)}
                      {#if Array.isArray(doc.type)}
                        {#each doc.type as type, i}
                          {@render span(type)}
                          {i < doc.type.length - 1 ? " | " : ""}
                        {/each}
                      {:else}
                        {@render span(doc.type)}
                      {/if}
                    {:else}
                      {#snippet span(typeName: string)}
                        <span class="prop-type">
                          {typeName}
                        </span>
                      {/snippet}

                      {#if Array.isArray(doc.type)}
                        {#each doc.type as { name }, i}
                          {@render span(name)}
                          {i < doc.type.length - 1 ? " | " : ""}
                        {/each}
                      {:else}
                        {@render span(doc.type.name)}
                      {/if}
                    {/if}
                    {doc.default === "" ? "" : `= ${doc.default}`}
                  {:else if isEvent(doc, index)}
                    <span class="prop-type">
                      : {doc.type}
                    </span>
                  {:else if isSnippet(doc, index)}
                    <span>
                      {#if doc.optional}
                        <span class="prop-type">?</span>
                      {/if}{!Array.isArray(doc.type) || doc.type.length ? " : { " : ""}
                    </span>

                    {#if Array.isArray(doc.type)}
                      {#each doc.type as type, i}
                        <span>
                          <b>{type.propName}</b>
                          {#if type.optional}
                            <span class="prop-type">?</span>
                          {/if}
                        </span>:
                        {@render span(type)}{i < doc.type.length - 1 ? "; " : "}"}
                      {/each}
                    {:else}
                      <b>{doc.type.propName}</b>
                      {#if doc.type.optional}
                        <span class="prop-type">?</span>
                      {/if}:
                      {@render span(doc.type)}
                    {/if}
                  {/if}
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

{#snippet span(type: PropType | SnippetType)}
  <span data-quaff class="prop-type" class:clickable={type.isClickable}>
    {type.name}
    {#if type.isClickable}
      <QTooltip class="q-pa-none">
        <QCodeBlock language="typescript" code={getType(type.name)} style="border-radius: 0" />
      </QTooltip>
    {/if}
  </span>
{/snippet}

<style lang="scss">
  .clickable {
    cursor: pointer;
    &:hover {
      color: var(--primary);
    }
  }

  .prop-type {
    opacity: 0.75;
    width: 100%;

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
