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
  import type { QComponentDocs, QComponentEvent, QComponentMethod } from "$docs";
  import {
    type MaybeParsed,
    type ParsedProperty,
    ParsedPropertyFlags,
  } from "$docgen/props/parsePropsInterface/defs";
  import { docsCtx } from "./QDocs.svelte";

  type TabableDocsKey = Exclude<
    keyof QComponentDocs["docs"],
    "generics" | "domAttributesConstraint"
  >;

  // #region:    --- Context
  let { componentDocs: docOrDocs } = docsCtx.assertGet("QApi should be used inside QDocs");
  const componentDocs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
  // #endregion: --- Context

  // #region:    --- Reactive variables
  let activeApiTabs: Exclude<
    keyof QComponentDocs["docs"],
    "generics" | "domAttributesConstraint"
  >[] = $state(componentDocs.map(() => "props"));
  let tooltipGeneration = 0;
  let tooltipTeardowns: (() => unknown)[] = [];
  // #endregion: --- Reactive variables

  // #region:    --- Effects
  $effect(() => {
    // Doesn't rerun if we don't use JSON.stringify
    JSON.stringify(activeApiTabs);

    const generation = ++tooltipGeneration;
    cleanupTooltips();
    attachTooltips(generation);

    return cleanupTooltips;
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  function hasFlag(prop: ParsedProperty, kind: Lowercase<keyof typeof ParsedPropertyFlags>) {
    switch (kind) {
      case "optional":
        return prop.flags & ParsedPropertyFlags.OPTIONAL;
      case "array":
        return prop.flags & ParsedPropertyFlags.ARRAY;
      case "bindable":
        return prop.flags & ParsedPropertyFlags.BINDABLE;
      case "snippet":
        return prop.flags & ParsedPropertyFlags.SNIPPET;
    }
  }

  function getType(type: string) {
    const getDef = (item: MaybeParsed) => {
      if (typeof item === "string") {
        return undefined;
      }

      return item.text === type ? item.typeDefinition : undefined;
    };

    for (const QDocument of componentDocs) {
      const { docs } = QDocument;

      for (const [_name, doc] of Object.entries(docs)) {
        if (!doc) {
          continue;
        }

        if (!Array.isArray(doc)) {
          // This is a DOM Attribute constraint definition
          const res = getDef(doc);

          if (res) {
            return res;
          }

          continue;
        }

        for (const item of doc) {
          if ("constraint" in item && item.constraint) {
            const { constraint } = item;

            const res = getDef(constraint);

            if (res) {
              return res;
            }

            continue;
          }

          if ("flags" in item) {
            const { type: itemType } = item;

            if (Array.isArray(itemType)) {
              for (const typeOfItem of itemType) {
                const res = getDef(typeOfItem);

                if (res) {
                  return res;
                }
              }

              continue;
            }

            const res = getDef(itemType);

            if (res) {
              return res;
            }

            continue;
          }
        }
      }
    }

    return null;
  }

  function getTabableEntries(QDocument: QComponentDocs) {
    return Object.entries(QDocument.docs).filter(
      ([name]) => name !== "generics" && name !== "domAttributesConstraint"
    ) as [TabableDocsKey, QComponentDocs["docs"][TabableDocsKey]][];
  }

  function isProp(
    doc: ParsedProperty | QComponentEvent | QComponentMethod,
    index: number
  ): doc is ParsedProperty {
    return activeApiTabs[index] === "props";
  }

  function isEvent(
    doc: ParsedProperty | QComponentEvent | QComponentMethod,
    index: number
  ): doc is QComponentEvent {
    return activeApiTabs[index] === "events";
  }

  function isSnippet(
    doc: ParsedProperty | QComponentEvent | QComponentMethod,
    index: number
  ): doc is ParsedProperty {
    return activeApiTabs[index] === "snippets";
  }

  function inSpan(
    spanContent: string,
    { typeStyle = false, isClickable = false, typeName = "", typeSrc = "" } = {}
  ) {
    const classes = [
      typeStyle && "prop-type",
      isClickable && "clickable",
      typeSrc && "link",
    ].filter(Boolean);
    const classString = classes.length ? ` class="${classes.join(" ")}"` : "";

    const dataAttrs = isClickable ? ` data-quaff data-type-name="${escape(typeName)}"` : "";

    const linkAttrs = typeSrc ? ` href="${typeSrc}" target="_blank"` : "";

    const tag = typeSrc ? "a" : "span";

    return `<${tag}${classString}${dataAttrs}${linkAttrs}>${spanContent}</${tag}>`;
  }

  function prepareHeaderForGenericsAndConstraints(name: string, docs: QComponentDocs["docs"]) {
    let content = `<pre>`;

    content += inSpan(`interface ${name}Props`, { typeStyle: true });

    if (docs.generics.length) {
      content += inSpan("<", { typeStyle: true });

      const generics = docs.generics.map((generic) => {
        let genericContent = inSpan(generic.name, { typeStyle: true });

        if (generic.constraint) {
          const { constraint } = generic;
          const isObject = typeof constraint !== "string";
          const text = isObject ? constraint.text : constraint;

          genericContent += inSpan(" extends ", { typeStyle: true }).concat(
            inSpan(escape(text), {
              typeStyle: true,
              isClickable: isObject,
              typeSrc: isObject ? constraint.typeSrc : "",
              typeName: text,
            })
          );
        }

        return genericContent;
      });

      content += generics.join(", ");

      content += inSpan(">", { typeStyle: true });
    }

    if (docs.domAttributesConstraint) {
      content += inSpan(" extends ", { typeStyle: true });

      const constraint = docs.domAttributesConstraint;
      const isObject = typeof constraint !== "string";
      const text = isObject ? constraint.text : constraint;

      content += inSpan(escape(text), {
        typeStyle: true,
        isClickable: isObject,
        typeSrc: isObject ? constraint.typeSrc : "",
        typeName: text,
      });
    }

    content += `</pre>`;

    return content;
  }

  function prepareHeaderForSnippet(snippet: ParsedProperty) {
    let content = "<pre>";

    if (hasFlag(snippet, "optional")) {
      content += inSpan("?.", { typeStyle: true });
    }

    content += inSpan("(", { typeStyle: true });

    if (Array.isArray(snippet.type)) {
      content += inSpan("{ ", { typeStyle: true });

      content += snippet.type
        .map((arg) => {
          const isObject = typeof arg !== "string";
          const text = isObject ? arg.text : arg;

          return inSpan(escape(text)).concat(
            inSpan(": "),
            inSpan(escape(text), {
              typeStyle: true,
              isClickable: isObject,
              typeSrc: isObject ? arg.typeSrc : "",
              typeName: text,
            })
          );
        })
        .join(", ");

      content += inSpan(" }", { typeStyle: true });
    } else {
      const { type } = snippet;
      const isObject = typeof type !== "string";
      const text = isObject ? type.text : type;

      if (text !== "void") {
        content += inSpan(escape(text), {
          typeStyle: true,
          isClickable: isObject,
          typeSrc: isObject ? type.typeSrc : "",
          typeName: text,
        });
      }
    }

    content += inSpan(")", { typeStyle: true });

    content += "</pre>";

    return content;
  }

  function prepareHeaderForProp(prop: ParsedProperty) {
    let content = "<pre>";

    if (prop.flags & ParsedPropertyFlags.OPTIONAL) {
      content += inSpan("?", { typeStyle: true });
    }

    content += inSpan(": ", { typeStyle: true });

    if (hasFlag(prop, "array") && Array.isArray(prop.type)) {
      content += inSpan("(", { typeStyle: true });
    }

    if (Array.isArray(prop.type)) {
      content += prop.type
        .map((type) => {
          const isObject = typeof type !== "string";
          const text = isObject ? type.text : type;

          return inSpan(escape(text), {
            typeStyle: true,
            isClickable: isObject,
            typeSrc: isObject ? type.typeSrc : "",
            typeName: text,
          });
        })
        .join(" | ");
    } else {
      const { type } = prop;
      const isObject = typeof type !== "string";
      const text = isObject ? type.text : type;

      content += inSpan(escape(text), {
        typeStyle: true,
        isClickable: isObject,
        typeSrc: isObject ? type.typeSrc : "",
        typeName: text,
      });
    }

    if (hasFlag(prop, "array")) {
      if (Array.isArray(prop.type)) {
        content += inSpan(")", { typeStyle: true });
      }

      content += inSpan("[]", { typeStyle: true });
    }

    if (prop.default) {
      content += inSpan(` = `);

      if (hasFlag(prop, "bindable")) {
        content += inSpan("$bindable(");
      }

      content += inSpan(escape(prop.default), { typeStyle: true });
    }

    if (hasFlag(prop, "bindable")) {
      content += inSpan(")");
    }

    content += "</pre>";

    return content;
  }

  function cleanupTooltips() {
    for (const teardown of tooltipTeardowns) {
      teardown();
    }

    tooltipTeardowns = [];
  }

  async function attachTooltips(generation: number) {
    await tick();

    if (generation !== tooltipGeneration) {
      return;
    }

    document.querySelectorAll("a.prop-type.link").forEach((el) => {
      const typeSrc = el.getAttribute("href");

      if (!(el instanceof HTMLElement) || !typeSrc || !el.parentElement) {
        return;
      }

      const tooltipContent = createRawSnippet(() => ({
        render() {
          return `<span class="flex items-center"></span>`;
        },
        setup(target) {
          mount(QIcon, {
            target,
            props: {
              name: "open_in_browser",
            },
          });

          const textNode = document.createElement("span");
          textNode.textContent = "Open in a new tab";
          textNode.classList.add("q-ml-xs");

          target.append(textNode);
        },
      }));

      const tooltip = mount(QTooltip, {
        target: el.parentElement,
        props: {
          target: el,
          children: tooltipContent,
        },
      });

      tooltipTeardowns.push(() => unmount(tooltip));
    });

    document.querySelectorAll("span.prop-type.clickable").forEach(async (el) => {
      const typeName = el.getAttribute("data-type-name");

      if (!typeName || !(el instanceof HTMLElement) || !el.parentElement) {
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

      tooltipTeardowns.push(() => unmount(tooltip));
    });
  }
  // #endregion: --- Functions
</script>

{#each componentDocs as QDocument, index (index)}
  <QCard class="q-px-none q-pb-none q-mt-lg">
    <div class="flex justify-between items-center q-px-md">
      <h5 class="no-margin">
        <QIcon name="info" />
        <span class="q-ml-md">{QDocument.name} API</span>
      </h5>
      <QTabs bind:value={activeApiTabs[index]} noSeparator class="no-margin">
        {#each getTabableEntries(QDocument) as [tabName, tabDoc] (tabName)}
          {#if tabDoc.length !== 0}
            <QTab name={tabName} style="min-width: 100px">
              <h6 style="margin: 0">{capitalize(tabName)}</h6>
            </QTab>
          {/if}
        {/each}
      </QTabs>
    </div>
    <QCardSection style="max-height: 416px; overflow-y: auto">
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
                <div class="q-api__doc-heading q-my-sm">
                  <span class="q-docs-code q-mr-xs">
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

  :global(.link) {
    display: unset;
  }

  :global(.prop-type) {
    opacity: 0.75;
    width: 100%;
    letter-spacing: 0.5px;
  }

  :global(.prop-type.clickable) {
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .q-api__doc-heading {
    display: flex;
    align-items: center;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    border-radius: 0;
  }

  .q-api__doc-heading :global(pre) {
    margin: 0;
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
