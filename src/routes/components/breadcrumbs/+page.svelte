<script lang="ts">
  import { tick } from "svelte";
  import { QBreadcrumbsDocs, QBreadcrumbsElDocs } from "$components/breadcrumbs/docs";
  import type { QBreadcrumbsGutterOptions } from "$components/breadcrumbs/props";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBreadcrumbs, QBreadcrumbsEl, QIcon, QSelect, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QBreadcrumbs — Breadcrumbs",
      "Build breadcrumb navigation in Svelte with QBreadcrumbs. Customize separators, icons, spacing, active colors, links, and item content."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QBreadcrumbsDocs, QBreadcrumbsElDocs] });

  const COLLECTIONS = [
    {
      id: "maps",
      title: "Maps",
      icon: "map",
      description: "Coastlines, contours and places in between.",
      records: [
        {
          id: "coast",
          title: "Coastal survey",
          date: "1924",
          code: "MAP 024",
          icon: "explore",
        },
        {
          id: "town",
          title: "Old town streets",
          date: "1936",
          code: "MAP 036",
          icon: "location_city",
        },
      ],
    },
    {
      id: "posters",
      title: "Posters",
      icon: "wall_art",
      description: "Big type, bright ink and local stories.",
      records: [
        {
          id: "fair",
          title: "Autumn makers fair",
          date: "1958",
          code: "POS 058",
          icon: "handyman",
        },
        {
          id: "harbor",
          title: "Harbor open day",
          date: "1962",
          code: "POS 062",
          icon: "sailing",
        },
      ],
    },
  ] as const;
  const SEPARATORS = [
    { label: "Slash", value: "/" },
    { label: "Middle dot", value: "·" },
    { label: "Chevron icon", value: "icon:chevron_right" },
  ];
  let collectionId = $state<string | undefined>("maps");
  let recordId = $state<string | undefined>();
  let separator = $state("icon:chevron_right");
  let gutter = $state<QBreadcrumbsGutterOptions>("sm");
  let showIcons = $state(true);
  let activeColor = $state("primary");
  let separatorColor = $state("on-surface-variant");
  let emphasizeCurrent = $state(false);
  const collection = $derived(COLLECTIONS.find((item) => item.id === collectionId));
  const record = $derived(collection?.records.find((item) => item.id === recordId));

  let catalogueHeading = $state<HTMLHeadingElement>();

  async function openLocation(nextCollection?: string, nextRecord?: string) {
    collectionId = nextCollection;
    recordId = nextRecord;
    await tick();
    catalogueHeading?.focus();
  }
</script>

<QDocs docDescription="Keep your place while exploring a hierarchy.">
  {#snippet display()}
    <div class="archive-preview surface q-pa-lg">
      <div class="label-medium text-tertiary">THE OPEN ARCHIVE</div>
      <h2 class="title-medium q-mt-xs q-mb-lg">Archive location</h2>
      <QBreadcrumbs
        separator="icon:chevron_right"
        separatorColor="on-surface-variant"
        aria-label="Archive preview"
      >
        <QBreadcrumbsEl href="#browse-a-collection" label="Archive" />
        <QBreadcrumbsEl label="Maps" />
      </QBreadcrumbs>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Browse a Collection">
      {#snippet sectionDescription()}
        Breadcrumbs provide a path back through a hierarchy. Open a record, then use the trail to
        return to its collection. Here <code>tag="button"</code> changes the view locally; the
        current location is a noninteractive <code>span</code>. Toggle icons and adjust separator
        spacing without leaving the archive.
      {/snippet}
      <div class="archive-workspace q-gap-lg">
        <div class="archive-browser q-pa-lg">
          <QBreadcrumbs
            {separator}
            {gutter}
            separatorColor="on-surface-variant"
            aria-label="Archive location"
          >
            <QBreadcrumbsEl
              tag={collection ? "button" : "span"}
              label="Archive"
              icon={showIcons ? "inventory_2" : undefined}
              aria-current={collection ? undefined : "location"}
              onclick={collection ? () => openLocation() : undefined}
            />
            {#if collection}
              <QBreadcrumbsEl
                tag={record ? "button" : "span"}
                label={collection.title}
                icon={showIcons ? collection.icon : undefined}
                aria-current={record ? undefined : "location"}
                onclick={record ? () => openLocation(collection.id) : undefined}
              />
            {/if}
            {#if record}<QBreadcrumbsEl label={record.title} aria-current="location" />{/if}
          </QBreadcrumbs>
          <div class="q-my-lg">
            {#if record}
              <div class="label-small text-tertiary">{record.code} · {record.date}</div>
              <h3 bind:this={catalogueHeading} tabindex="-1" class="headline-small q-mt-xs q-mb-sm">
                {record.title}
              </h3>
              <p class="body-medium text-on-surface-variant q-mb-none">
                Use the trail above to return to the collection or the archive.
              </p>
            {:else if collection}
              <div class="label-small text-tertiary">
                COLLECTION · {collection.records.length} RECORDS
              </div>
              <h3 bind:this={catalogueHeading} tabindex="-1" class="headline-small q-mt-xs q-mb-sm">
                {collection.title}
              </h3>
              <p class="body-medium text-on-surface-variant q-mt-none">{collection.description}</p>
              <div class="catalogue-items q-gap-sm">
                {#each collection.records as item (item.id)}
                  <button
                    class="catalogue-item flex items-center q-gap-md q-pa-md text-on-surface"
                    type="button"
                    onclick={() => openLocation(collection.id, item.id)}
                  >
                    <QIcon name={item.icon} size="lg" color="tertiary" aria-hidden="true" />
                    <span
                      ><span class="title-medium">{item.title}</span><span
                        class="body-small text-on-surface-variant">{item.date}</span
                      ></span
                    >
                    <QIcon name="chevron_right" aria-hidden="true" />
                  </button>
                {/each}
              </div>
            {:else}
              <div class="label-small text-tertiary">THE OPEN ARCHIVE</div>
              <h3 bind:this={catalogueHeading} tabindex="-1" class="headline-small q-mt-xs q-mb-md">
                Choose a collection
              </h3>
              <div class="catalogue-items q-gap-sm">
                {#each COLLECTIONS as item (item.id)}
                  <button
                    class="catalogue-item flex items-center q-gap-md q-pa-md text-on-surface"
                    type="button"
                    onclick={() => openLocation(item.id)}
                  >
                    <QIcon name={item.icon} size="lg" color="tertiary" aria-hidden="true" />
                    <span
                      ><span class="title-medium">{item.title}</span><span
                        class="body-small text-on-surface-variant"
                        >{item.records.length} records</span
                      ></span
                    >
                    <QIcon name="chevron_right" aria-hidden="true" />
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          <p class="location-status body-small text-on-surface-variant q-my-none" role="status">
            Viewing {record?.title ?? collection?.title ?? "all collections"}
          </p>
        </div>
        <div class="controls q-gap-md">
          <QSelect
            label="Trail separator"
            options={SEPARATORS}
            bind:value={separator}
            emitValue
            outlined
          />
          <QSelect
            label="Trail spacing"
            options={["none", "sm", "md", "lg"]}
            bind:value={gutter}
            outlined
          />
          <QSwitch label="Show collection icons" bind:value={showIcons} />
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Custom Markers and Content">
      {#snippet sectionDescription()}
        Supply a <code>separator</code> snippet for custom markup, an <code>icon</code> snippet for
        your own artwork, and children instead of <code>label</code> for richer item content. This
        catalog reference uses <code>tag="strong"</code> for its final element.
      {/snippet}
      <div class="reference-card q-pa-lg">
        <div class="label-medium text-tertiary q-mb-md">FROM THE CATALOGUE</div>
        <QBreadcrumbs aria-label="Catalogue reference">
          {#snippet separator()}<span class="trail-marker" aria-hidden="true"></span>{/snippet}
          <QBreadcrumbsEl label="Archive">
            {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
                ><path d="M4 7h16v13H4zM3 3h18v4H3z" stroke="currentColor" stroke-width="2" /><path
                  d="M9 11h6"
                  stroke="currentColor"
                  stroke-width="2"
                /></svg
              >{/snippet}
          </QBreadcrumbsEl>
          <QBreadcrumbsEl label="Maps" />
          <QBreadcrumbsEl tag="strong" aria-current="location">
            <span class="flex items-center q-gap-sm">
              <span class="record-code tertiary-container q-py-xs q-px-sm text-weight-regular"
                >MAP 024</span
              >
              <span>Coastal survey</span>
            </span>
          </QBreadcrumbsEl>
        </QBreadcrumbs>
        <p class="body-medium text-on-surface-variant q-mt-lg q-mb-none">
          The identifier accompanies the title when a record is shared with another researcher.
        </p>
      </div>
    </QDocsSection>

    <QDocsSection title="Links and Current Pages">
      {#snippet sectionDescription()}
        Use <code>to</code> for app routes and <code>href</code> for URLs or anchors. Route matches
        receive <code>activeColor</code>; <code>activeClass</code> and <code>activeStyle</code> can
        add emphasis. An element can override those shared active styles. Exact route links receive
        <code>aria-current="page"</code> automatically. These links lead to the actual docs pages.
      {/snippet}
      <div class="reference-card q-pa-lg">
        <div class="label-medium text-tertiary q-mb-md">PATTERN REFERENCE</div>
        <QBreadcrumbs
          {activeColor}
          {separatorColor}
          separator="icon:chevron_right"
          activeClass={emphasizeCurrent ? "text-bold" : undefined}
          activeStyle={emphasizeCurrent ? "font-style: italic" : undefined}
          aria-label="Documentation path"
        >
          <QBreadcrumbsEl
            to="/components"
            label="Components"
            icon="widgets"
            activeClass=""
            activeStyle=""
          />
          <QBreadcrumbsEl to="/components/breadcrumbs/" label="Breadcrumbs" />
        </QBreadcrumbs>
        <div class="controls link-controls q-gap-md">
          <QSelect
            label="Active link color"
            options={["primary", "secondary", "tertiary"]}
            bind:value={activeColor}
            outlined
          />
          <QSelect
            label="Separator color"
            options={["on-surface-variant", "primary", "tertiary"]}
            bind:value={separatorColor}
            outlined
          />
          <QSwitch label="Emphasize current page" bind:value={emphasizeCurrent} />
        </div>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .archive-preview {
    width: min(100%, 340px);
    max-height: 100%;
    overflow: auto;
    border-radius: 24px;
  }
  .archive-workspace {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
  .archive-browser,
  .reference-card {
    min-width: 0;
    background: var(--surface-container-low);
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
  }
  .archive-browser :global(.q-breadcrumbs__el) {
    padding-block: 4px;
  }
  :is(.archive-preview, .archive-browser, .reference-card)
    :global(.q-breadcrumbs__separator > .q-icon) {
    display: block;
  }
  .archive-browser :global(button.q-breadcrumbs__el) {
    border: 0;
    border-radius: 4px;
    color: var(--tertiary);
    font: inherit;
    background: transparent;
    cursor: pointer;
  }
  .archive-browser :global(button.q-breadcrumbs__el:hover) {
    background: var(--tertiary-container);
  }
  .archive-browser :global(button.q-breadcrumbs__el:focus-visible),
  .catalogue-item:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
  }
  .catalogue-items {
    display: grid;
  }
  .catalogue-item {
    flex-wrap: nowrap;
    width: 100%;
    border: 0;
    border-radius: 16px;
    font: inherit;
    text-align: start;
    background: var(--surface-container);
    cursor: pointer;
  }
  .catalogue-item:hover {
    background: var(--surface-container-high);
  }
  .catalogue-item > span {
    display: grid;
    gap: 4px;
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .location-status {
    border-radius: 0;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--outline-variant);
  }
  .controls {
    display: grid;
    align-content: start;
    min-width: 0;
  }
  .link-controls {
    margin-block-start: 24px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  }
  .trail-marker {
    display: block;
    width: 6px;
    height: 6px;
    border: 1px solid var(--tertiary);
    border-radius: 0;
    rotate: 45deg;
  }
  .record-code {
    border-radius: 4px;
    white-space: nowrap;
  }
  @media (max-width: 1000px) {
    .archive-workspace {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 400px) {
    .archive-browser,
    .reference-card {
      padding: 16px;
    }
    .catalogue-item {
      gap: 8px;
      padding: 12px;
    }
  }
</style>
