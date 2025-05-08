<script lang="ts">
  import { createRawSnippet, mount, tick } from "svelte";
  import Types from "$utils/types.json";
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
  import type { QComponentDocs, QComponentEvent, QComponentMethod } from "$utils";
  import type { ParsedProp, ParsedSnippet } from "$docgen/props/parseInterface";

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

  function inSpan(
    spanContent: string,
    { typeStyle = false, isClickable = false, typeName = "" } = {}
  ) {
    const classes = [typeStyle && "prop-type", isClickable && "clickable"].filter(Boolean);
    const classString = classes.length ? ` class="${classes.join(" ")}"` : "";

    const dataAttrs = isClickable ? ` data-quaff data-type-name="${escape(typeName)}"` : "";

    return `<span${classString}${dataAttrs}>${spanContent}</span>`;
  }

  function prepareHeaderForSnippet(snippet: ParsedSnippet) {
    let content = "<pre>";

    if (snippet.optional) {
      content += inSpan("?.", { typeStyle: true });
    }

    content += inSpan("(", { typeStyle: true });

    if (snippet.type.length) {
      content += inSpan("{ ", { typeStyle: true });

      content += snippet.type
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

      content += inSpan(" }", { typeStyle: true });
    }

    content += inSpan(")", { typeStyle: true });

    content += "</pre>";

    return content;
  }

  function prepareHeaderForProp(prop: ParsedProp) {
    let content = "<pre>";

    if (prop.optional) {
      content += inSpan("?", { typeStyle: true });
    }

    content += inSpan(": ", { typeStyle: true });

    if (prop.isArray && Array.isArray(prop.type)) {
      content += inSpan("(", { typeStyle: true });
    }

    if (Array.isArray(prop.type)) {
      content += prop.type
        .map((type) =>
          inSpan(escape(type.name), {
            typeStyle: true,
            isClickable: type.isClickable,
            typeName: type.name,
          })
        )
        .join(" | ");
    } else {
      content += inSpan(escape(prop.type.name), {
        typeStyle: true,
        isClickable: prop.type.isClickable,
        typeName: prop.type.name,
      });
    }

    if (prop.isArray) {
      if (Array.isArray(prop.type)) {
        content += inSpan(")", { typeStyle: true });
      }

      content += inSpan("[]", { typeStyle: true });
    }

    if (prop.default) {
      content += inSpan(` = ${prop.default}`);
    }

    content += "</pre>";

    return content;
  }

  async function attachTooltips() {
    await tick();

    document.querySelectorAll("span.clickable").forEach(async (el) => {
      const typeName = el.getAttribute("data-type-name");

      if (!typeName) {
        return;
      }

      const type = getType(typeName) || "/* No definition found */";

      const { codeToHtml } = await import("shiki");

      const html = await codeToHtml(type, {
        lang: "typescript",
        theme: Quaff.darkMode.isActive ? "github-dark-default" : "github-light-default",
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

      mount(QTooltip, {
        target: el,
        props: {
          class: "q-pa-none transparent",
          children: snip,
        },
      });
    });
  }

  $effect(() => {
    // Doesn't rerun if we don't use JSON.stringify
    JSON.stringify(api);

    attachTooltips();
  });
</script>

{#each componentDocs as QDocument, index (index)}
  <QCard class="q-px-none q-pb-none q-mt-lg">
    <div class="flex justify-between items-center q-px-md">
      <h5 class="no-margin">
        <QIcon name="info" />
        <span class="q-ml-md">{QDocument.name} API</span>
      </h5>
      <QTabs bind:value={api[index]} noSeparator class="no-margin">
        {#each Object.entries(QDocument.docs) as [tabName, _tabDoc] (tabName)}
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
        {#each QDocument.docs[api[index]] as doc (doc)}
          <QItem>
            <QItemSection type="content">
              {#snippet headline()}
                <div class="q-my-sm flex-center" style="display: flex; flex: 1 1 0">
                  <span
                    class="q-px-sm q-py-xs q-mr-xs"
                    style="background-color: var(--surface-container); border-radius: 0.5rem"
                  >
                    <b>{doc.name}</b>
                  </span>
                  {#if isProp(doc, index)}
                    {@html prepareHeaderForProp(doc)}
                  {:else if isSnippet(doc, index)}
                    {@html prepareHeaderForSnippet(doc)}
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
