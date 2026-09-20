<script lang="ts">
  import { QSideSheetDocs } from "$components/side-sheet/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QAvatar,
    QBtn,
    QCard,
    QCheckbox,
    QIcon,
    QInput,
    QItem,
    QItemSection,
    QList,
    QSideSheet,
    QSwitch,
  } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QSideSheetDocs });

  let isPreviewOpen = $state(true);
  let isDocsReviewComplete = $state(true);
  let isReleaseReady = $state(false);
  let isFileSheetOpen = $state(true);
  let selectedFileIndex = $state(0);
  const files = $state([
    {
      name: "Brand guidelines",
      icon: "description" as const,
      color: "primary-container",
      type: "Document",
      updated: "Today",
      isPinned: true,
    },
    {
      name: "Spring campaign",
      icon: "slideshow" as const,
      color: "tertiary-container",
      type: "Presentation",
      updated: "Yesterday",
      isPinned: false,
    },
    {
      name: "Content calendar",
      icon: "table_chart" as const,
      color: "secondary-container",
      type: "Spreadsheet",
      updated: "Sep 12",
      isPinned: false,
    },
  ]);
  const selectedFile = $derived(files[selectedFileIndex]);

  let isFilterSheetOpen = $state(false);
  let draftSearch = $state("");
  let isDraftOnlineOnly = $state(false);
  let search = $state("");
  let isOnlineOnly = $state(false);
  const workshops = [
    {
      title: "Make a little pottery",
      location: "Studio 12 · In person",
      icon: "local_florist" as const,
      color: "tertiary-container",
      isOnline: false,
    },
    {
      title: "Sketch your everyday",
      location: "Saturday · Online",
      icon: "draw" as const,
      color: "primary-container",
      isOnline: true,
    },
    {
      title: "Grow a balcony garden",
      location: "Sunday · Online",
      icon: "potted_plant" as const,
      color: "secondary-container",
      isOnline: true,
    },
  ];
  const visibleWorkshops = $derived(
    workshops.filter(
      (workshop) =>
        workshop.title.toLowerCase().includes(search.toLowerCase()) &&
        (!isOnlineOnly || workshop.isOnline)
    )
  );

  let isPreferencesSheetOpen = $state(true);
  let isRightToLeft = $state(false);
  let hasReadingHints = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QSideSheet")}</title>
</svelte:head>

<QDocs docDescription="Keep useful details and tools beside the content they belong to.">
  {#snippet display()}
    <div class="preview-frame" class:sheet-open={isPreviewOpen}>
      <div class="preview-main">
        <div class="label-large text-on-surface-variant">YOUR WORKSPACE</div>
        <h2 class="headline-small">Ready to launch</h2>
        <QCard fill="tertiary" flat>
          <QList>
            <QItem
              clickable
              onclick={() => (isPreviewOpen = true)}
              aria-label="Open launch checklist"
            >
              <QItemSection>
                {#snippet headline()}
                  <QIcon name="rocket_launch" class="q-mb-md" aria-hidden="true" />
                  <div class="title-medium">Launch checklist</div>
                {/snippet}
                {#snippet line1()}
                  {Number(isDocsReviewComplete) + Number(isReleaseReady)} of 2 complete
                {/snippet}
              </QItemSection>
            </QItem>
          </QList>
        </QCard>
        <p class="body-small text-on-surface-variant">Select the checklist to see its details.</p>
      </div>
      <QSideSheet bind:value={isPreviewOpen} headline="Task details" bordered>
        <div class="sheet-content">
          <div class="identity-row">
            <QAvatar size="sm" class="primary-container">DS</QAvatar>
            <div>
              <div class="label-large">Design system</div>
              <div class="body-small text-on-surface-variant">Release checklist</div>
            </div>
          </div>
          <div class="checklist">
            <QCheckbox bind:value={isDocsReviewComplete} label="Review the docs" />
            <QCheckbox bind:value={isReleaseReady} label="Write release notes" />
          </div>
        </div>
        {#snippet actions()}
          <QBtn
            label="Done"
            filled
            size="sm"
            expressive={false}
            onclick={() => (isPreviewOpen = false)}
          />
        {/snippet}
      </QSideSheet>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Standard sheet">
        {#snippet sectionDescription()}
          Select a file to edit its details alongside the list. Place the sheet in a flex row with a
          flexible main area, and bind <code>value</code> to control visibility. The default width
          is
          <code>16rem</code>; this example uses <code>20rem</code>.
        {/snippet}

        <div class="workspace" class:sheet-open={isFileSheetOpen}>
          <div class="workspace-main">
            <div class="workspace-heading">
              <QIcon name="folder_open" class="text-primary" aria-hidden="true" />
              <div>
                <h2 class="title-large">Creative studio</h2>
                <p class="body-medium text-on-surface-variant">
                  Shared files · {files.length} items
                </p>
              </div>
            </div>
            <QList expressive segmented selection="single" aria-label="Shared files">
              {#each files as file, index (index)}
                <QItem
                  clickable
                  active={isFileSheetOpen && selectedFileIndex === index}
                  onclick={() => {
                    selectedFileIndex = index;
                    isFileSheetOpen = true;
                  }}
                >
                  <QItemSection type="avatar">
                    <QAvatar size="md" class={file.color}>
                      <QIcon name={file.icon} aria-hidden="true" />
                    </QAvatar>
                  </QItemSection>
                  <QItemSection>
                    {#snippet headline()}{file.name || "Untitled file"}{/snippet}
                    {#snippet line1()}{file.type} · {file.updated}{/snippet}
                  </QItemSection>
                  {#if file.isPinned}
                    <QItemSection type="trailingIcon">
                      <QIcon name="keep" size="sm" aria-label="Pinned" />
                    </QItemSection>
                  {/if}
                </QItem>
              {/each}
            </QList>
            <p class="body-small text-on-surface-variant q-mt-lg">
              Select a file to open its details.
            </p>
          </div>

          <QSideSheet bind:value={isFileSheetOpen} headline="File details" width="20rem" bordered>
            <div class="sheet-content">
              <div class={["file-summary", selectedFile.color]}>
                <QIcon name={selectedFile.icon} size="2.5rem" aria-hidden="true" />
                <span class="label-large">{selectedFile.type}</span>
              </div>
              <QInput bind:value={selectedFile.name} label="File name" outlined />
              <div class="identity-row">
                <QAvatar size="sm" class="secondary-container">AL</QAvatar>
                <div>
                  <div class="label-large">Alex Lee</div>
                  <div class="body-small text-on-surface-variant">Owner · Creative studio</div>
                </div>
              </div>
              <QSwitch bind:value={selectedFile.isPinned} label="Pin to workspace" />
            </div>
            {#snippet actions()}
              <QBtn
                label="Done"
                filled
                size="sm"
                expressive={false}
                onclick={() => (isFileSheetOpen = false)}
              />
            {/snippet}
          </QSideSheet>
        </div>
      </QDocsSection>

      <QDocsSection title="Modal sheet">
        {#snippet sectionDescription()}
          Use <code>modal</code> when a task needs focus or there is less room beside the main
          content. It opens over the page and closes with the close button, Escape, or a click on
          the scrim. Compose fields in the body and put completion buttons in the
          <code>actions</code> snippet.
        {/snippet}

        <QCard flat bordered class="workshops-card">
          <div class="workshops-heading">
            <div>
              <div class="label-large text-primary">MAKE TIME TO MAKE</div>
              <h2 class="headline-small">Weekend workshops</h2>
              <p class="body-medium text-on-surface-variant" aria-live="polite">
                {visibleWorkshops.length} workshops to explore
              </p>
            </div>
            <QBtn icon="tune" label="Filters" tonal onclick={() => (isFilterSheetOpen = true)} />
          </div>
          <QList expressive segmented aria-label="Workshops">
            {#each visibleWorkshops as workshop (workshop.title)}
              <QItem>
                <QItemSection type="avatar">
                  <QAvatar size="md" class={workshop.color}>
                    <QIcon name={workshop.icon} aria-hidden="true" />
                  </QAvatar>
                </QItemSection>
                <QItemSection>
                  {#snippet headline()}{workshop.title}{/snippet}
                  {#snippet line1()}{workshop.location}{/snippet}
                </QItemSection>
              </QItem>
            {:else}
              <p class="q-pa-lg body-medium">
                No workshops match. Try another search or clear your filters.
              </p>
            {/each}
          </QList>
        </QCard>

        <QSideSheet bind:value={isFilterSheetOpen} headline="Find a workshop" modal width="22rem">
          <div class="sheet-content">
            <p class="body-medium text-on-surface-variant">
              A small creative break for your weekend.
            </p>
            <QInput bind:value={draftSearch} label="Search workshops" outlined />
            <QCheckbox bind:value={isDraftOnlineOnly} label="Online only" />
            <QCard fill="tertiary" flat>
              <QIcon name="lightbulb" aria-hidden="true" />
              <p class="body-medium q-mt-sm">
                All workshops welcome beginners. Bring your curiosity.
              </p>
            </QCard>
          </div>
          {#snippet actions()}
            <QBtn
              label="Apply"
              filled
              size="sm"
              expressive={false}
              onclick={() => {
                search = draftSearch;
                isOnlineOnly = isDraftOnlineOnly;
                isFilterSheetOpen = false;
              }}
            />
            <QBtn
              label="Clear"
              flat
              size="sm"
              expressive={false}
              onclick={() => {
                draftSearch = "";
                isDraftOnlineOnly = false;
              }}
            />
          {/snippet}
        </QSideSheet>
      </QDocsSection>

      <QDocsSection title="Placement and shape">
        {#snippet sectionDescription()}
          Sheets open at the logical <code>end</code> edge by default. Set <code>side="start"</code>
          to use the leading edge; both follow the reading direction. Add <code>detached</code> for rounded
          corners and space around the sheet.
        {/snippet}

        <QCheckbox bind:value={isRightToLeft} label="Right-to-left layout" class="q-mb-md" />
        <div
          class="placement-demo"
          class:sheet-open={isPreferencesSheetOpen}
          dir={isRightToLeft ? "rtl" : "ltr"}
        >
          <div class="placement-main">
            <QIcon name="auto_stories" size="2rem" class="text-primary" aria-hidden="true" />
            <h2 class="title-large">Your reading space</h2>
            <p class="body-medium text-on-surface-variant">Make yourself comfortable.</p>
            <QBtn
              label="Reading preferences"
              outlined
              onclick={() => (isPreferencesSheetOpen = true)}
            />
          </div>
          <QSideSheet
            bind:value={isPreferencesSheetOpen}
            headline="Preferences"
            side="start"
            detached
          >
            <div class="sheet-content">
              <QSwitch bind:value={hasReadingHints} label="Reading hints" />
              <p class="body-small text-on-surface-variant">Show helpful notes while you read.</p>
            </div>
          </QSideSheet>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .preview-frame,
  .workspace,
  .placement-demo {
    display: flex;
    width: 100%;
    overflow: hidden;
    border: 0.0625rem solid var(--outline-variant);
    border-radius: 1rem;
    background: var(--surface-container-low);
    color: var(--on-surface);
  }

  .preview-frame {
    height: 20rem;
    max-width: 42rem;
  }

  .preview-main,
  .workspace-main,
  .placement-main {
    flex: 1;
    min-width: 0;
  }

  .preview-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.875rem;
    padding: 1.25rem;
  }

  .preview-main h2,
  .workspace-heading h2,
  .workshops-heading h2,
  .placement-main h2 {
    margin: 0;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .identity-row,
  .workspace-heading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .identity-row > div {
    min-width: 0;
  }

  .checklist {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .workspace {
    height: 30rem;
  }

  .workspace-main {
    padding: 1.5rem;
  }

  .workspace-heading {
    margin-bottom: 1.5rem;
  }

  .file-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
  }

  :global(.workshops-card) {
    max-width: 48rem;
    padding: 1.5rem;
  }

  .workshops-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .workshops-heading h2 {
    margin-block: 0.5rem;
  }

  .placement-demo {
    min-height: 19rem;
  }

  .placement-main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
  }

  @media (max-width: 40rem) {
    .preview-frame.sheet-open .preview-main,
    .workspace.sheet-open .workspace-main,
    .placement-demo.sheet-open .placement-main {
      display: none;
    }

    .preview-frame {
      justify-content: flex-end;
    }

    .workspace-main {
      padding: 1rem;
    }
  }
</style>
