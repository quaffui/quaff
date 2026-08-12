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
    Quaff,
  } from "$lib";
  import { capitalize, escape } from "$utils";
  import type { QApiEntry, QComponentDocs, QComponentEvent, QComponentMethod } from "$docs";
  import {
    getQuaffHighlighter,
    quaffShikiDarkTheme,
    quaffShikiLightTheme,
  } from "$internal/shikiTheme";
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
  let tooltipGeneration = 0;
  let apiElements: (HTMLElement | undefined)[] = $state([]);
  // Lifecycle ownership only; making this reactive would retrigger the effect while it attaches.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const tooltipTeardowns = new Map<number, TooltipTeardown[]>();
  // #endregion: --- Reactive variables

  // #region:    --- Effects
  $effect(() => {
    // Doesn't rerun if we don't use JSON.stringify
    JSON.stringify(activeApiTabs);

    const generation = ++tooltipGeneration;
    cleanupTooltips();

    void attachTooltips(generation, Quaff.darkMode.isActive).catch((error: unknown) => {
      cleanupTooltips(generation);

      if (generation === tooltipGeneration) {
        console.error("Error while attaching QApi tooltips", error);
      }
    });

    return () => {
      ++tooltipGeneration;
      cleanupTooltips(generation);
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
    let content = `<pre>`;

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

    content += `</pre>`;

    return content;
  }

  function cleanupTooltips(generation?: number) {
    const generations = generation === undefined ? [...tooltipTeardowns.keys()] : [generation];

    for (const generationToClean of generations) {
      const teardowns = tooltipTeardowns.get(generationToClean) || [];
      tooltipTeardowns.delete(generationToClean);

      for (const teardown of teardowns) {
        try {
          void Promise.resolve(teardown()).catch((error: unknown) => {
            console.error("Error while detaching a QApi tooltip", error);
          });
        } catch (error) {
          console.error("Error while detaching a QApi tooltip", error);
        }
      }
    }
  }

  async function attachTooltips(generation: number, darkMode: boolean) {
    await tick();

    if (generation !== tooltipGeneration) {
      return;
    }

    const teardowns: TooltipTeardown[] = [];
    tooltipTeardowns.set(generation, teardowns);

    for (const apiElement of apiElements) {
      apiElement?.querySelectorAll<HTMLElement>("a.link[href]").forEach((el) => {
        const typeSrc = el.getAttribute("href");

        if (!typeSrc || !el.parentElement) {
          return;
        }

        const tooltipContent = createRawSnippet(() => ({
          render() {
            return `<span class="flex items-center"></span>`;
          },
          setup(target) {
            const icon = mount(QIcon, {
              target,
              props: {
                name: "open_in_browser",
              },
            });

            const textNode = document.createElement("span");
            textNode.textContent = "Open in a new tab";
            textNode.classList.add("q-ml-xs");

            target.append(textNode);

            return () => {
              void unmount(icon).catch((error: unknown) => {
                console.error("Error while detaching a QApi tooltip icon", error);
              });
              textNode.remove();
            };
          },
        }));

        const tooltip = mount(QTooltip, {
          target: el.parentElement,
          props: {
            target: el,
            children: tooltipContent,
          },
        });

        teardowns.push(() => unmount(tooltip));
      });
    }

    if (generation !== tooltipGeneration) {
      cleanupTooltips(generation);
      return;
    }

    const theme = darkMode ? quaffShikiDarkTheme : quaffShikiLightTheme;
    const highlighter = await getQuaffHighlighter("typescript", theme);

    if (generation !== tooltipGeneration) {
      cleanupTooltips(generation);
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

        if (generation !== tooltipGeneration) {
          return;
        }

        const snip = createRawSnippet(() => ({
          render: () => html,
        }));
        const tooltip = mount(QTooltip, {
          target: el.parentElement,
          props: {
            target: el,
            class: "q-pa-none transparent",
            children: snip,
          },
        });

        teardowns.push(() => unmount(tooltip));
      });
    }
  }
  // #endregion: --- Functions
</script>

{#each componentDocs as QDocument, index (QDocument)}
  <div bind:this={apiElements[index]} class="q-api">
    <QCard class="q-px-none q-pb-none q-mt-lg">
      <div class="flex justify-between items-center q-px-md">
        <h5>
          <QIcon name="info" />
          <span class="q-ml-md">{QDocument.name} API</span>
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
        <QList separator bordered>
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
