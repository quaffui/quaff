<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import { createRawSnippet, mount, tick, unmount } from "svelte";
  import {
    QCard,
    QCardSection,
    QIcon,
    QItem,
    QItemSection,
    QList,
    QTab,
    QTabs,
    QTooltip,
    QBtn,
    Quaff,
  } from "$lib";
  import { capitalize, escape } from "$utils";
  import type { QApiEntry, QComponentDocs, QComponentEvent, QComponentMethod } from "$docs";
  import {
    getQuaffHighlighter,
    quaffShikiDarkTheme,
    quaffShikiLightTheme,
  } from "$internal/shikiTheme";
  import { COMPONENT_PARENT_FOLDER } from "$internal/componentRegistry";
  import { getOwnTypeDefinition } from "./QApi.utils";
  import { docsCtx } from "./QDocs.svelte";

  type TabableDocsKey = Exclude<
    keyof QComponentDocs["docs"],
    "generics" | "domAttributesConstraint" | "typeDependencies"
  >;
  type TooltipTeardown = () => void | Promise<void>;

  // #region:    --- Context
  let { componentDocs: docOrDocs } = docsCtx.assertGet("QApi should be used inside QDocs");
  const componentDocs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
  // #endregion: --- Context

  // #region:    --- Reactive variables
  let activeApiTabs: TabableDocsKey[] = $state(componentDocs.map(() => "props"));
  let apiElements: (HTMLElement | undefined)[] = $state([]);
  // #endregion: --- Reactive variables

  // #region:    --- Effects
  $effect(() => {
    // Doesn't rerun if we don't use JSON.stringify
    JSON.stringify(activeApiTabs);

    let isCancelled = false;
    const teardowns: TooltipTeardown[] = [];

    void attachTooltips(Quaff.darkMode.isActive, teardowns, () => isCancelled).catch(
      (error: unknown) => {
        cleanupTooltips(teardowns);

        if (!isCancelled) {
          console.error("Error while attaching QApi tooltips", error);
        }
      }
    );

    return () => {
      isCancelled = true;
      cleanupTooltips(teardowns);
    };
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  function getTabableEntries(QDocument: QComponentDocs) {
    return Object.entries(QDocument.docs).filter(
      ([name]) =>
        name !== "generics" && name !== "domAttributesConstraint" && name !== "typeDependencies"
    ) as [TabableDocsKey, QComponentDocs["docs"][TabableDocsKey]][];
  }

  function isGeneratedEntry(doc: QApiEntry | QComponentEvent | QComponentMethod): doc is QApiEntry {
    return "header" in doc;
  }

  function inTypeSpan(content: string) {
    return `<span class="prop-type">${escape(content)}</span>`;
  }

  function prepareHeaderForGenericsAndConstraints(name: string, docs: QComponentDocs["docs"]) {
    let content = `<div class="q-api__doc-heading"><pre>`;

    content += inTypeSpan(`interface ${name}Props`);

    if (docs.generics.length) {
      content += inTypeSpan("<");

      const generics = docs.generics.map((generic) => {
        let genericContent = inTypeSpan(generic.name);

        if (generic.constraint) {
          genericContent += inTypeSpan(" extends ");
          genericContent += generic.constraint;
        }

        if (generic.default) {
          genericContent += inTypeSpan(" = ");
          genericContent += generic.default;
        }

        return genericContent;
      });

      content += generics.join(", ");

      content += inTypeSpan(">");
    }

    if (docs.domAttributesConstraint) {
      content += inTypeSpan(" extends ");
      content += docs.domAttributesConstraint;
    }

    content += `</pre></div>`;

    return content;
  }

  function cleanupTooltips(teardowns: TooltipTeardown[]) {
    for (const teardown of teardowns.splice(0)) {
      try {
        void Promise.resolve(teardown()).catch((error: unknown) => {
          console.error("Error while detaching a QApi tooltip", error);
        });
      } catch (error) {
        console.error("Error while detaching a QApi tooltip", error);
      }
    }
  }

  async function attachTooltips(
    darkMode: boolean,
    teardowns: TooltipTeardown[],
    isCancelled: () => boolean
  ) {
    await tick();

    if (isCancelled()) {
      return;
    }

    for (const apiElement of apiElements) {
      apiElement?.querySelectorAll<HTMLElement>("a.link[href]").forEach((el) => {
        const typeSrc = el.getAttribute("href");

        if (!typeSrc || !el.parentElement) {
          return;
        }

        const tooltip = mount(QTooltip, {
          target: el.parentElement,
          props: {
            target: el,
            children: externalLinkTooltip,
          },
        });

        teardowns.push(() => unmount(tooltip));
      });
    }

    const theme = darkMode ? quaffShikiDarkTheme : quaffShikiLightTheme;
    const highlighter = await getQuaffHighlighter("typescript", theme);

    if (isCancelled()) {
      return;
    }

    for (const [index, QDocument] of componentDocs.entries()) {
      const apiElement = apiElements[index];

      apiElement?.querySelectorAll<HTMLElement>("[data-quaff][data-type-name]").forEach((el) => {
        const typeName = el.getAttribute("data-type-name");

        if (!typeName || !el.parentElement) {
          return;
        }

        const type =
          getOwnTypeDefinition(QDocument.docs.typeDependencies, typeName) ??
          "/* No definition found */";
        const html = highlighter.codeToHtml(type, {
          lang: "typescript",
          theme,
          transformers: [
            {
              pre(node) {
                node.properties.style += ";padding: 1rem; text-align: left;";
              },
            },
          ],
        });

        const snip = createRawSnippet(() => ({
          render: () => html,
        }));
        const tooltip = mount(QTooltip, {
          target: el.parentElement,
          props: {
            target: el,
            class: "q-pa-none transparent",
            style: "max-width: calc(100vw - 1rem)",
            children: snip,
          },
        });

        teardowns.push(() => unmount(tooltip));
      });
    }
  }
  // #endregion: --- Functions
</script>

{#snippet externalLinkTooltip()}
  <span class="flex items-center">
    <QIcon name="open_in_browser" />
    <span class="q-ml-xs">Open in a new tab</span>
  </span>
{/snippet}

{#each componentDocs as QDocument, index (QDocument)}
  {@const path = COMPONENT_PARENT_FOLDER[QDocument.name as keyof typeof COMPONENT_PARENT_FOLDER]}

  <div bind:this={apiElements[index]} class="q-api">
    <QCard class="q-px-none q-pb-none q-mt-lg">
      <div class="flex justify-between items-center q-px-md">
        <h5>
          <QIcon name="info" />
          <span class="q-mx-md">{QDocument.name} API</span>
          {#if path}
            <QBtn
              label="Source"
              outlined
              rectangle
              size="xs"
              href="https://github.com/quaffui/quaff/tree/main/src/lib/{path}/{QDocument.name}.svelte"
            >
              {#snippet icon()}
                <svg
                  fill="var(--primary)"
                  width="18px"
                  height="18px"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
                  />
                </svg>
              {/snippet}
            </QBtn>
          {/if}
        </h5>
        <QTabs bind:value={activeApiTabs[index]} noSeparator class="q-api__tabs">
          {#each getTabableEntries(QDocument) as [tabName, tabDoc] (tabName)}
            {#if tabDoc.length !== 0}
              <QTab name={tabName} style="min-width: 100px">
                <h6 style="margin: 0">{capitalize(tabName)}</h6>
              </QTab>
            {/if}
          {/each}
        </QTabs>
      </div>
      <QCardSection class="q-px-md q-pb-md" style="max-height: 416px; overflow-y: auto">
        <QList separator bordered preserveTabOrder>
          {@const docs = QDocument.docs}
          {#if activeApiTabs[index] === "props" && (docs.generics.length || docs.domAttributesConstraint)}
            <QItem>
              <QItemSection>
                {#snippet headline()}
                  {@html prepareHeaderForGenericsAndConstraints(QDocument.name, docs)}
                {/snippet}
              </QItemSection>
            </QItem>
          {/if}
          {#each docs[activeApiTabs[index]] as doc (doc)}
            <QItem>
              <QItemSection type="content">
                {#snippet headline()}
                  {#if isGeneratedEntry(doc)}
                    {@html doc.header}
                  {:else}
                    <div class="q-api__doc-heading q-my-sm">
                      <span class="q-docs-code q-mr-xs">
                        <b>{doc.name}</b>
                      </span>
                      <span class="prop-type">
                        {activeApiTabs[index] === "events" ? `: ${doc.type}` : doc.type}
                      </span>
                    </div>
                  {/if}
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
  </div>
{/each}

<style lang="scss">
  :global(.q-api .clickable) {
    cursor: pointer;
    &:hover {
      color: var(--primary);
    }
  }

  :global(.q-api .link) {
    display: unset;
  }

  :global(.q-api .prop-type) {
    opacity: 0.75;
    width: 100%;
    letter-spacing: 0.5px;
  }

  :global(.q-api .prop-type.clickable) {
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  :global(.q-api .q-api__doc-heading) {
    display: flex;
    align-items: center;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    border-radius: 0;
  }

  :global(.q-api .q-api__doc-heading pre) {
    margin: 0;
  }

  :global(.q-drawer.api-drawer .q-api pre) {
    margin: 0;
    border-radius: inherit;
    white-space: pre-wrap;
  }

  :global(.q-api .prop-description > a:hover) {
    color: var(--primary);
  }

  :global(.q-api .q-api__tabs .q-tab) {
    background-color: transparent;
  }
</style>
