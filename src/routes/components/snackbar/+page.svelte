<script lang="ts">
  import { resolve } from "$app/paths";
  import { QSnackbarDocs } from "#components/snackbar/docs.js";
  import type { QSnackbarAction, QSnackbarDismissReason } from "#components/snackbar/props.js";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QDocs, QDocsSection } from "#docs";
  import { QBtn, QSelect, QSnackbar, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QSnackbar — Snackbar",
      "Give brief feedback with QSnackbar for Svelte. Explore messages, optional actions, close buttons, placement, accessibility, and the Notify utility."
    )
  );

  docsCtx.set({ snippets, componentDocs: QSnackbarDocs });

  interface Feedback {
    message?: string;
    note?: string;
    action?: QSnackbarAction;
  }
  const DURATIONS = [
    { label: "4 seconds", value: 4000 },
    { label: "6 seconds", value: 6000 },
    { label: "10 seconds", value: 10000 },
    { label: "Keep open", value: 0 },
  ];
  const OFFSETS = [
    { label: "Above navigation", value: "calc(var(--offset-bottom, 0px) + 12px)" },
    { label: "Extra space", value: "calc(var(--offset-bottom, 0px) + 48px)" },
    { label: "Viewport edge · 12px", value: 12 },
  ];
  const COLLECTION_NOTE = "Please wrap the book in paper.";
  let activeFeedback = $state<Feedback>();
  let pendingFeedback: Feedback | undefined;
  let snackbar = $state<ReturnType<typeof QSnackbar>>();
  let isVisible = $state(false);
  let timeout = $state(6000);
  let offset = $state<string | number>(OFFSETS[0].value);
  let dismissible = $state(false);
  let actionOnNewLine = $state(false);
  let isOnReadingList = $state(true);
  let isNoteSaved = $state(false);
  let lastDismissal = $state<QSnackbarDismissReason>();
  let hiddenCount = $state(0);

  function showFeedback(feedback: Feedback) {
    if (activeFeedback) {
      pendingFeedback = feedback;
      snackbar?.hide();
      return;
    }

    activeFeedback = feedback;
    snackbar?.show();
  }

  function finishFeedback() {
    hiddenCount += 1;
    activeFeedback = undefined;

    if (pendingFeedback) {
      const nextFeedback = pendingFeedback;
      pendingFeedback = undefined;
      showFeedback(nextFeedback);
    }
  }

  function removeBook() {
    isOnReadingList = false;
    showFeedback({
      message: "Paper Moons was removed from your reading list.",
      action: { label: "Undo", handler: () => (isOnReadingList = true) },
    });
  }

  function restoreBook() {
    isOnReadingList = true;
    showFeedback({ message: "Paper Moons is back on your reading list." });
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="snackbar-preview full-width overflow-auto surface q-pa-lg">
      <h2 class="title-medium q-mt-none q-mb-sm">Bookshop updates</h2>
      <p class="body-medium text-on-surface-variant q-mt-none q-mb-md">
        The shop is open until 18:00.
      </p>
      <QBtn
        variant="tonal"
        label="Show message"
        onclick={() => showFeedback({ message: "The bookshop is open until 18:00 today." })}
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Messages and Actions">
      {#snippet sectionDescription()}
        Set <code>message</code> for plain text, add an <code>action</code> for a related choice, or
        use <code>children</code> for custom content. <code>actionOnNewLine</code> places the action below
        the message. These small bookshop examples share one snackbar so messages never overlap. A new
        message waits for the previous exit transition.
      {/snippet}

      <div class="column no-wrap q-gap-md">
        <div class="snackbar-example full-width surface q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-sm">Plain message</h3>
          <p class="body-medium q-mt-none q-mb-md">Shop hours: 10:00–18:00.</p>
          <QBtn
            variant="tonal"
            label="Show shop hours"
            onclick={() => showFeedback({ message: "The bookshop is open until 18:00 today." })}
          />
        </div>

        <div class="snackbar-example full-width surface q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-sm">An action to undo a change</h3>
          <p class="body-medium q-mt-none q-mb-md">
            Paper Moons: {isOnReadingList
              ? "saved to your reading list"
              : "removed from your list"}.
          </p>
          <div class="flex items-center q-gap-md">
            <QBtn
              variant="tonal"
              label={isOnReadingList ? "Remove book" : "Restore book"}
              onclick={isOnReadingList ? removeBook : restoreBook}
            />
            <QSwitch label="Action on a new line" bind:value={actionOnNewLine} />
          </div>
        </div>

        <div class="snackbar-example full-width surface q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-sm">Custom message content</h3>
          <p class="body-medium q-mt-none q-mb-md">
            {isNoteSaved ? "Saved collection note:" : "Collection note:"}
            {COLLECTION_NOTE}
          </p>
          <QBtn
            variant="tonal"
            label="Save collection note"
            onclick={() => {
              isNoteSaved = true;
              showFeedback({ note: COLLECTION_NOTE });
            }}
          />
        </div>
      </div>

      <QSnackbar
        bind:this={snackbar}
        bind:value={isVisible}
        message={activeFeedback?.message}
        action={activeFeedback?.action}
        {actionOnNewLine}
        {timeout}
        {offset}
        {dismissible}
        dismissLabel="Dismiss bookshop update"
        onDismiss={(reason) => (lastDismissal = reason)}
        onHidden={finishFeedback}
      >
        <strong>Note saved.</strong>
        {activeFeedback?.note}
      </QSnackbar>
    </QDocsSection>

    <QDocsSection title="Timing, Placement and Lifecycle">
      {#snippet sectionDescription()}
        A plain snackbar closes after six seconds by default. Nonzero <code>timeout</code> values
        are limited to 4000–10000 milliseconds; use <code>0</code> to keep it open. An
        <code>action</code> or <code>dismissible</code> close button prevents automatic dismissal. These
        controls apply to the shared snackbar above.
      {/snippet}

      <div class="snackbar-example full-width surface q-pa-lg">
        <div class="snackbar-options flex items-start q-gap-md q-mb-md">
          <QSelect
            class="min-width-0"
            label="Message duration"
            options={DURATIONS}
            bind:value={timeout}
            emitValue
            outlined
          />
          <QSelect
            class="min-width-0"
            label="Snackbar placement"
            options={OFFSETS}
            bind:value={offset}
            emitValue
            outlined
          />
        </div>
        <QSwitch label="Show a close button" bind:value={dismissible} class="q-mb-md" />
        <div class="flex q-gap-sm">
          <QBtn
            variant="tonal"
            label="Show message"
            onclick={() => showFeedback({ message: "The bookshop is open until 18:00 today." })}
          />
          <QBtn
            variant="outlined"
            label="Hide message"
            disabled={!isVisible}
            onclick={() => snackbar?.hide()}
          />
        </div>
        <p class="body-small text-on-surface-variant q-mt-md q-mb-none">
          Last dismissal: {lastDismissal ?? "none yet"}. Finished closing: {hiddenCount}.
        </p>
      </div>
      <p class="body-medium">
        <code>offset</code> accepts pixels or a CSS length. This example starts above the layout's
        bottom navigation. <code>onDismiss</code> reports <code>action</code>,
        <code>dismiss</code>, <code>programmatic</code> or <code>timeout</code> when dismissal
        begins.
        <code>onHidden</code> runs after the exit transition. Bind <code>value</code> or call
        <code>show()</code>, <code>hide()</code> and <code>toggle()</code> on the instance.
      </p>
    </QDocsSection>

    <QDocsSection title="Accessible Feedback" noCode>
      {#snippet sectionDescription()}
        <p>
          Messages use a polite live region and do not move focus automatically. Keep the outcome
          visible in the page as well. Tab reaches snackbar actions; Escape closes the snackbar when
          focus is inside it. Give the close button a useful <code>dismissLabel</code>.
        </p>
        <p>
          Use QSnackbar for feedback owned by a component. For app-wide notifications that should
          appear one after another, use the <a class="q-docs-link" href={resolve("/utils/notify")}
            >Notify API</a
          >.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .snackbar-example :global(.q-switch) {
    max-width: 100%;
  }

  .snackbar-preview,
  .snackbar-example {
    max-width: 640px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .snackbar-preview {
    max-width: 340px;
    max-height: 100%;
  }

  .snackbar-options :global(.q-field) {
    flex: 1 1 200px;
  }
</style>
