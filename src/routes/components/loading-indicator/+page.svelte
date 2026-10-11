<script lang="ts">
  import { onDestroy } from "svelte";
  import { resolve } from "$app/paths";
  import { QLoadingIndicatorDocs } from "#components/loading-indicator/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QBtn, QIcon, QInput, QLoadingIndicator, QSelect, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QLoadingIndicator — Loading Indicator",
      "Show short waits with Quaff's animated Material 3 loading indicator for Svelte. Try contained styles, sizes, colors, and button or card examples."
    )
  );

  docsCtx.set({ snippets, componentDocs: QLoadingIndicatorDocs });

  const INITIAL_TITLE = "Project notes";
  const FILES = [
    { name: "Project brief.pdf", detail: "64 KB", icon: "description" },
    { name: "Cover image.png", detail: "128 KB", icon: "image" },
    { name: "Checklist.txt", detail: "2 KB", icon: "description" },
  ] as const;
  const SIZES = [24, 48, 96, 144, 240];
  const COLORS = [
    { label: "Automatic", value: "auto" },
    { label: "Primary", value: "primary" },
    { label: "Tertiary", value: "tertiary" },
    { label: "On primary container", value: "on-primary-container" },
  ];
  const CONTAINERS = [
    { label: "Primary container", value: "primary-container" },
    { label: "Secondary container", value: "secondary-container" },
    { label: "Tertiary container", value: "tertiary-container" },
  ];

  let contained = $state(true);
  let indicatorSize = $state(96);
  let indicatorColor = $state("auto");
  let containerColor = $state("primary-container");
  let isRefreshing = $state(false);
  let hasNewFile = $state(false);
  let refreshStatus = $state("Two files are available. Refresh to check for updates.");
  let documentTitle = $state(INITIAL_TITLE);
  let savedTitle = $state("");
  let isSaving = $state(false);
  let saveStatus = $state("Edit the title, then save your changes.");
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const availableFiles = $derived(hasNewFile ? FILES : FILES.slice(0, 2));
  const canSave = $derived(documentTitle.trim().length > 0 && documentTitle.trim() !== savedTitle);

  function refreshFiles() {
    if (isRefreshing) {
      return;
    }

    isRefreshing = true;
    refreshStatus = "Checking for updated files…";
    refreshTimer = setTimeout(() => {
      hasNewFile = true;
      isRefreshing = false;
      refreshStatus = "Files are up to date. Three files are available.";
    }, 1800);
  }

  function cancelRefresh() {
    clearTimeout(refreshTimer);
    isRefreshing = false;
    refreshStatus = "Refresh cancelled. Your files are unchanged.";
  }

  function saveTitle() {
    if (isSaving || !canSave) {
      return;
    }

    const draft = documentTitle.trim();
    isSaving = true;
    saveStatus = "Saving your changes…";
    saveTimer = setTimeout(() => {
      savedTitle = draft;
      isSaving = false;
      saveStatus = `Saved “${draft}” in this demo.`;
    }, 1400);
  }

  function updateTitleStatus() {
    if (!documentTitle.trim()) {
      saveStatus = "Enter a title before saving.";
      return;
    }

    saveStatus =
      documentTitle.trim() === savedTitle
        ? "No unsaved changes."
        : "Unsaved changes. Save when ready.";
  }

  function resetTitle() {
    documentTitle = INITIAL_TITLE;
    savedTitle = "";
    saveStatus = "Title reset. You can try another edit.";
  }

  onDestroy(() => {
    clearTimeout(refreshTimer);
    clearTimeout(saveTimer);
  });
</script>

<QDocs>
  {#snippet display()}
    <div
      class="example-frame loading-preview column no-wrap items-center q-gap-md full-width overflow-auto surface q-pa-lg text-center"
    >
      <QLoadingIndicator contained size="72px" aria-label="Loading files preview" />
      <h2 class="title-large q-ma-none">Loading your files</h2>
      <p class="body-medium text-on-surface-variant q-ma-none">
        Your workspace will be ready shortly.
      </p>
    </div>
  {/snippet}

  {#snippet usage()}
    <p class="q-mb-lg">
      Use QLoadingIndicator for short waits of about 200ms to 5 seconds. For longer tasks or known
      progress, use <a class="q-docs-link" href={resolve("/components/progress")}>QProgress</a>.
    </p>

    <QDocsSection title="Appearance">
      {#snippet sectionDescription()}
        Add <code>contained</code> for a circular background. <code>size</code> defaults to
        <code>48px</code> and accepts pixels as a number or a CSS length. Try sizes from 24px to
        240px. <code>color</code> and <code>containerColor</code> accept theme names or CSS colors; keep
        at least 3:1 contrast between the shape and its background.
      {/snippet}
      <div class="indicator-controls row q-gutter-md q-mb-md">
        <QSelect
          class="col-12 col-sm-4 min-width-0"
          label="Indicator size"
          bind:value={indicatorSize}
          options={SIZES}
          outlined
        />
        <QSelect
          class="col-12 col-sm-4 min-width-0"
          label="Indicator color"
          bind:value={indicatorColor}
          options={COLORS}
          emitValue
          outlined
        />
        <QSelect
          class="col-12 col-sm-4 min-width-0"
          label="Container color"
          bind:value={containerColor}
          options={CONTAINERS}
          emitValue
          disabled={!contained}
          outlined
        />
      </div>
      <QSwitch label="Contained indicator" bind:value={contained} class="q-mb-md" />
      <div class="example-frame full-width bg-surface-container-low q-pa-lg">
        <div class="indicator-window overflow-auto">
          <div
            class="indicator-stage flex no-wrap flex-center"
            style:min-width={`${indicatorSize}px`}
          >
            <QLoadingIndicator
              size={indicatorSize}
              {contained}
              color={indicatorColor === "auto" ? undefined : indicatorColor}
              {containerColor}
              aria-label="Loading indicator style preview"
            />
          </div>
        </div>
        <p class="body-medium q-ma-none text-center">Loading files…</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Refresh Files">
      {#snippet sectionDescription()}
        Show the indicator while content refreshes, then replace it with the result. Mark the
        content region with <code>aria-busy</code> and keep a persistent status message outside it. This
        demo finishes after a short delay; cancelling keeps the existing files.
      {/snippet}
      <div class="example-frame full-width surface q-pa-lg">
        <div class="flex items-center justify-between q-gap-md">
          <h3 class="title-large q-ma-none">Recent files</h3>
          <QBtn
            variant="outlined"
            icon={isRefreshing ? "close" : "refresh"}
            label={isRefreshing ? "Cancel refresh" : "Refresh files"}
            onclick={() => (isRefreshing ? cancelRefresh() : refreshFiles())}
          />
        </div>
        <div class="file-content q-my-lg" aria-busy={isRefreshing}>
          {#if isRefreshing}
            <div class="file-loading column no-wrap flex-center q-gap-md text-center">
              <QLoadingIndicator contained size="64px" aria-label="Loading recent files" />
              <span class="body-medium">Checking for updates…</span>
            </div>
          {:else}
            <ul class="file-list column no-wrap q-gap-sm q-pa-none q-ma-none">
              {#each availableFiles as file (file.name)}
                <li class="flex no-wrap items-center q-gap-md q-py-sm">
                  <QIcon name={file.icon} class="text-primary" aria-hidden="true" />
                  <div class="min-width-0">
                    <h4 class="title-medium q-mb-xs">{file.name}</h4>
                    <p class="body-small text-on-surface-variant q-ma-none">{file.detail}</p>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        <p class="body-medium q-ma-none" role="status">{refreshStatus}</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Save Changes">
      {#snippet sectionDescription()}
        A 24px indicator fits beside a button label. Keep the label stable, set
        <code>aria-busy</code>, and disable the action while it runs. Here the indicator is
        <code>aria-hidden</code> because the button and nearby status already describe the work. No data
        leaves this page.
      {/snippet}
      <div class="example-frame full-width surface q-pa-lg">
        <QInput
          label="Document title"
          bind:value={documentTitle}
          oninput={updateTitleStatus}
          disabled={isSaving}
          maxlength={80}
          outlined
        />
        <div class="flex items-center q-gap-sm q-my-lg">
          <QBtn
            variant="tonal"
            disabled={isSaving || !canSave}
            aria-busy={isSaving}
            onclick={saveTitle}
          >
            <span class="flex no-wrap items-center q-gap-sm">
              {#if isSaving}<QLoadingIndicator
                  size="24px"
                  color="primary"
                  aria-hidden="true"
                />{:else}<QIcon name="save" size="24px" aria-hidden="true" />{/if}
              <span class="min-width-0">Save changes</span>
            </span>
          </QBtn>
          <QBtn variant="flat" label="Reset title" disabled={isSaving} onclick={resetTitle} />
        </div>
        <p class="body-medium q-ma-none" role="status">{saveStatus}</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Loading and Accessibility" noCode>
      {#snippet sectionDescription()}
        Each indicator is an indeterminate <code>progressbar</code>. Give it a short contextual
        <code>aria-label</code> when it conveys progress. It does not announce a percentage. Keep the
        action's result visible after the indicator disappears, and avoid moving keyboard focus as content
        updates. The animation respects reduced-motion preferences.
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .example-frame,
  .indicator-controls {
    max-width: 640px;
  }

  .example-frame {
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .loading-preview {
    max-width: 352px;
    max-height: 100%;
  }

  .indicator-window {
    max-width: 100%;
  }

  .indicator-stage {
    min-height: 264px;
  }

  .file-content,
  .file-loading {
    min-height: 208px;
  }

  .file-list {
    list-style: none;
  }

  @include mixins.up-to-sm {
    .example-frame {
      padding: 16px;
    }
  }
</style>
