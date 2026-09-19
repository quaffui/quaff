<script lang="ts">
  import { resolve } from "$app/paths";
  import { QLoadingIndicatorDocs } from "$components/loading-indicator/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardSection, QIcon, QLoadingIndicator } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QLoadingIndicatorDocs });

  let isSaving = $state(false);
  let hasSaved = $state(false);
  let isRefreshing = $state(false);

  async function saveChanges() {
    if (isSaving) {
      return;
    }

    isSaving = true;
    hasSaved = false;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    isSaving = false;
    hasSaved = true;
  }

  async function refreshLibrary() {
    if (isRefreshing) {
      return;
    }

    isRefreshing = true;
    await new Promise((resolve) => setTimeout(resolve, 1800));
    isRefreshing = false;
  }
</script>

<svelte:head>
  <title>{pageTitle("QLoadingIndicator")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard
      class="flex column flex-center q-gap-md text-center"
      style="width: 75%; min-height: 15rem"
    >
      <QLoadingIndicator contained size="6rem" aria-label="Loading your library" />
      <span class="title-large">Loading your library</span>
    </QCard>
  {/snippet}

  {#snippet usage()}
    <p class="q-mb-lg">
      Use QLoadingIndicator for short waits of about 200ms to 5 seconds. For longer tasks or known
      progress, use <a href={resolve("/components/progress", {})}>QProgress</a>.
    </p>

    <QDocsSection title="Variants">
      {#snippet sectionDescription()}
        Add <code>contained</code> for a circular background. Give each indicator an
        <code>aria-label</code> describing what is loading.
      {/snippet}

      <div class="flex items-center q-gap-xl q-my-md">
        <div class="flex column items-center q-gap-sm">
          <QLoadingIndicator aria-label="Loading messages" />
          <span>Default</span>
        </div>
        <div class="flex column items-center q-gap-sm">
          <QLoadingIndicator contained aria-label="Loading photos" />
          <span>Contained</span>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Sizes and Colors">
      {#snippet sectionDescription()}
        The default size is <code>3rem</code>. Use <code>size</code> for sizes between
        <code>1.5rem</code> and <code>15rem</code> at the default root font size. Customize
        <code>color</code>
        and <code>containerColor</code> with theme names or CSS colors. Keep at least 3:1 contrast between
        the indicator and its background.
      {/snippet}

      <div class="flex items-center q-gap-lg q-my-md">
        <QLoadingIndicator size="1.5rem" aria-label="Loading suggestions" />
        <QLoadingIndicator size="3rem" color="tertiary" aria-label="Loading playlists" />
        <QLoadingIndicator
          contained
          size="6rem"
          color="on-tertiary-container"
          containerColor="tertiary-container"
          aria-label="Loading albums"
        />
      </div>
    </QDocsSection>
    <QDocsSection title="Inside a Button">
      {#snippet sectionDescription()}
        Use a small indicator while an action completes. Select Save changes to try it.
      {/snippet}

      <div class="flex column items-start q-gap-md">
        <QBtn
          type="button"
          variant="tonal"
          disabled={isSaving}
          aria-busy={isSaving}
          onclick={saveChanges}
        >
          <span class="flex items-center q-gap-sm">
            {#if isSaving}
              <QLoadingIndicator size="1.5rem" color="primary" aria-hidden="true" />
            {:else}
              <QIcon name="save" size="1.5rem" aria-hidden="true" />
            {/if}
            <span>Save changes</span>
          </span>
        </QBtn>
        <span role="status" style="min-height: 1.5em">
          {#if isSaving}
            Saving changes…
          {:else if hasSaved}
            Changes saved.
          {/if}
        </span>
      </div>
    </QDocsSection>

    <QDocsSection title="Loading Card Content">
      {#snippet sectionDescription()}
        Keep space for content while it refreshes. Select Refresh to preview the loading state.
      {/snippet}

      <QCard style="max-width: 22.5rem">
        <QCardSection class="flex items-center justify-between q-gap-md">
          <span class="title-large">Library</span>
          <QBtn
            type="button"
            variant="outlined"
            icon="refresh"
            label="Refresh"
            aria-label="Refresh library"
            disabled={isRefreshing}
            onclick={refreshLibrary}
          />
        </QCardSection>
        <QCardSection class="flex column items-center q-gap-md q-mt-lg">
          <div class="flex flex-center" style="height: 5rem" aria-busy={isRefreshing}>
            {#if isRefreshing}
              <QLoadingIndicator contained aria-label="Loading your library" />
            {:else}
              <QIcon name="library_books" size="3rem" color="primary" aria-hidden="true" />
            {/if}
          </div>
          <span role="status">
            {isRefreshing ? "Refreshing library…" : "Your library is up to date."}
          </span>
        </QCardSection>
      </QCard>
    </QDocsSection>
  {/snippet}
</QDocs>
