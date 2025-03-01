<script lang="ts">
  import { createRawSnippet, mount, tick } from "svelte";
  import { QCard, QIcon, QTabs, QTab, QCardSection, QList, QItem, QItemSection } from "$lib";
  import { capitalize, escape } from "$lib/utils";
  import Types from "$lib/utils/types.json";
  import type { QComponentDocs, QComponentEvent, QComponentMethod } from "$lib/utils";
  import type { ParsedProp, ParsedSnippet } from "$docgen/props/parseInterface";
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

  function prepareHeader(prop: ParsedProp | ParsedSnippet) {
    const className = (typeStyle: boolean, isClickable: boolean, typeName: string) => {
      if (!typeStyle && !isClickable) {
        return "";
      }

      return ` class="${typeStyle ? "prop-type" : ""} ${isClickable ? "clickable" : ""}"${isClickable ? ' data-quaff data-type-name="' + escape(typeName) + '"' : ""}`;
    };
    const inSpan = (
      spanContent: string,
      { typeStyle = false, isClickable = false, typeName = "" } = {}
    ) => `<span${className(typeStyle, isClickable, typeName)}>${spanContent}</span>`;

    let content = "<pre>";

    if (prop.optional) {
      content += inSpan("?", { typeStyle: true });

      if (prop.isSnippet) {
        content += inSpan(".", { typeStyle: true });
      }
    }

    if (prop.isSnippet) {
      content += inSpan("(", { typeStyle: true });
    } else if (!Array.isArray(prop.type) || prop.type.length) {
      content += inSpan(": ");
    }

    if (prop.isArray && Array.isArray(prop.type)) {
      content += inSpan("(", { typeStyle: true });
    }

    if (prop.isSnippet && Array.isArray(prop.type) && prop.type.length) {
      content += inSpan("{ ", { typeStyle: true });
    }

    if (Array.isArray(prop.type)) {
      if (prop.isSnippet) {
        content += prop.type
          .map((arg) => {
            return inSpan(escape(arg.propName)).concat(
              inSpan(": "),
              inSpan(escape(arg.name), {
                typeStyle: true,
                isClickable: arg.isClickable,
                typeName: arg.name,
              })
            );
          })
          .join(", ");
      } else {
        content += prop.type
          .map((t) =>
            inSpan(escape(t.name), {
              typeStyle: true,
              isClickable: t.isClickable,
              typeName: t.name,
            })
          )
          .join(" | ");
      }
    } else {
      content += inSpan(escape(prop.type.name), {
        typeStyle: true,
        isClickable: prop.type.isClickable,
        typeName: prop.type.name,
      });
    }

    if (prop.isSnippet) {
      if (Array.isArray(prop.type) && prop.type.length) {
        content += inSpan(" }", { typeStyle: true });
      }

      content += inSpan(")", { typeStyle: true });
    }

    if (prop.isArray) {
      content += inSpan(Array.isArray(prop.type) ? ")[]" : "[]", { typeStyle: true });
    }

    if (prop.default) {
      content += inSpan(` = ${prop.default}`);
    }

    content += "</pre>";
    return content;
  }

  async function attachTooltips() {
    await tick();

    document.querySelectorAll("span.clickable").forEach((el) => {
      const typeName = el.getAttribute("data-type-name");

      if (!typeName) {
        return;
      }

      const type = getType(typeName) || "/* No definition found */";

      import("shiki").then(({ codeToHtml }) => {
        codeToHtml(type, {
          lang: "typescript",
          theme: "github-dark-default",
          transformers: [
            {
              pre(node) {
                node.properties.style += ";padding: 1rem; text-align: left;";
              },
            },
          ],
        }).then((html) => {
          const snip = createRawSnippet(() => ({
            render: () => html,
          }));

          mount(QTooltip, {
            target: el,
            props: {
              class: "q-pa-none transparent",
              children: snip,
            },
          });
        });
      });
    });
  }

  $effect(() => {
    // Doesn't rerun if we don't use JSON.stringify
    JSON.stringify(api);

    attachTooltips();
  });
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
    <QCardSection style="max-height: 416px; overflow-y: auto">
      <QList separator bordered style="overflow-x:auto">
        {#each QDocument.docs[api[index]] as doc}
          <QItem>
            <QItemSection type="content">
              {#snippet headline()}
                <div class="q-my-sm" style="display: flex; flex: 1 1 0">
                  <span class="surface-variant">
                    <b>{doc.name}</b>
                  </span>
                  {#if isProp(doc, index) || isSnippet(doc, index)}
                    {@html prepareHeader(doc)}
                  {:else if isEvent(doc, index)}
                    <span class="prop-type">
                      : {doc.type}
                    </span>
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

<style lang="scss">
  :global(.clickable) {
    cursor: pointer;
    &:hover {
      color: var(--primary);
    }
  }

  :global(.prop-type) {
    opacity: 0.75;
    width: 100%;
    letter-spacing: 0.5px;

    &:global(.clickable) {
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
