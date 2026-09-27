<script lang="ts">
  import { QDialogDocs } from "$components/dialog/docs";
  import type { QDialogPositionOptions } from "$components/dialog/props";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageMeta } from "$docs/metadata";
  import { QBtn, QDialog, QIcon, QInput, QSelect } from "$lib";
  import { useMeta } from "$lib/meta";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QDialog — Dialog",
      "Present dialogs in your Svelte app with QDialog. Explore modal, persistent, positioned, and full-screen dialogs with programmatic controls."
    )
  );

  docsCtx.set({ snippets, componentDocs: QDialogDocs });

  let objectOpen = $state(false);
  let reviewOpen = $state(false);
  let collectionOpen = $state(false);
  let positionedOpen = $state(false);
  let editorOpen = $state(false);
  let guideOpen = $state(false);
  let guide = $state<QDialog>();
  let position = $state<QDialogPositionOptions>("right");
  let reviewed = $state(false);
  let collected = $state(false);
  let guideCloses = $state(0);
  let borrower = $state("Eastbank Library");
  let duration = $state("One month");
  let draftBorrower = $state("");
  let draftDuration = $state("");

  function focusDialogTitle(heading: HTMLElement) {
    // The opening animation initially keeps dialog content hidden.
    let frame: number;

    function focusWhenVisible() {
      if (getComputedStyle(heading).visibility === "visible") {
        heading.focus();
        return;
      }

      frame = requestAnimationFrame(focusWhenVisible);
    }

    frame = requestAnimationFrame(focusWhenVisible);
    return () => cancelAnimationFrame(frame);
  }

  function editLoan() {
    draftBorrower = borrower;
    draftDuration = duration;
    editorOpen = true;
  }

  function saveLoan(event: SubmitEvent) {
    event.preventDefault();

    if (!draftBorrower.trim()) {
      return;
    }

    borrower = draftBorrower.trim();
    duration = draftDuration;
    editorOpen = false;
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="dialog-preview flex column items-center q-gap-md text-center">
      <h2 class="headline-small q-ma-none">Open a dialog</h2>
      <p class="body-medium q-ma-none">
        Display content above the page, then dismiss it to continue.
      </p>
      <QBtn label="Open dialog" variant="tonal" onclick={() => (objectOpen = true)} />
    </div>
  {/snippet}

  {#snippet usage()}
    <div class="dialog-usage">
      <QDocsSection title="Basic Dialog">
        {#snippet sectionDescription()}
          Use <code>bind:value</code> with a boolean <code>$state</code> variable to open and close a
          dialog. By default the rest of the page stays interactive. Click outside or press Escape to
          dismiss it. The collection details in these examples are fictional.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg flex items-center q-gap-lg">
          <QIcon name="museum" size="32px" class="text-primary" aria-hidden="true" />
          <div class="example-copy">
            <span class="label-medium text-on-surface-variant">COLLECTION RECORD · 014</span>
            <h3 class="title-large q-mt-xs q-mb-none">The River Keeps Going</h3>
            <p class="body-medium q-mt-xs q-mb-none">Mara Wells · Screenprint · 1987</p>
          </div>
          <QBtn label="View record" variant="outlined" onclick={() => (objectOpen = true)} />
        </div>

        <QDialog bind:value={objectOpen} aria-labelledby="object-title">
          <span class="label-medium text-on-surface-variant">COLLECTION RECORD · 014</span>
          <h3
            id="object-title"
            class="headline-small"
            tabindex="-1"
            {@attach objectOpen ? focusDialogTitle : undefined}
          >
            The River Keeps Going
          </h3>
          <p class="body-medium">Mara Wells · Screenprint on paper · 1987</p>
          <dl class="dialog-facts flex column q-gap-md q-my-lg body-medium">
            <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
              <dt class="col-12 col-md-4 text-on-surface-variant">Edition</dt>
              <dd class="col-12 col-md-8 q-ma-none">14 of 40</dd>
            </div>
            <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
              <dt class="col-12 col-md-4 text-on-surface-variant">Care</dt>
              <dd class="col-12 col-md-8 q-ma-none">Keep away from direct sunlight</dd>
            </div>
          </dl>
          <div class="flex justify-end q-gap-sm q-mt-lg">
            <QBtn label="Close record" variant="flat" onclick={() => (objectOpen = false)} />
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Modal Dialog">
        {#snippet sectionDescription()}
          Add <code>modal</code> to make the background inert and keep keyboard focus inside the dialog.
          Escape and outside clicks still dismiss it.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg">
          <div class="flex items-center q-gap-lg">
            <div class="example-copy">
              <h3 class="title-large q-ma-none">Loan review</h3>
              <p class="body-medium q-mt-xs q-mb-none">
                Check the destination and duration before approving.
              </p>
            </div>
            <QBtn label="Review loan" variant="tonal" onclick={() => (reviewOpen = true)} />
          </div>
          <p
            class="flex items-center q-gap-sm q-mt-lg q-mb-none body-medium text-on-surface-variant"
            role="status"
          >
            <QIcon name={reviewed ? "check_circle" : "schedule"} aria-hidden="true" />
            {reviewed ? "Loan reviewed" : "Awaiting review"}
          </p>
        </div>

        <QDialog bind:value={reviewOpen} modal aria-labelledby="review-title">
          <h3
            id="review-title"
            class="headline-small"
            tabindex="-1"
            {@attach reviewOpen ? focusDialogTitle : undefined}
          >
            Review this loan
          </h3>
          <p class="body-medium">The River Keeps Going</p>
          <dl class="dialog-facts flex column q-gap-md q-my-lg body-medium">
            <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
              <dt class="col-12 col-md-4 text-on-surface-variant">Borrower</dt>
              <dd class="col-12 col-md-8 q-ma-none">{borrower}</dd>
            </div>
            <div class="row q-col-gutter-x-md q-col-gutter-y-xs">
              <dt class="col-12 col-md-4 text-on-surface-variant">Duration</dt>
              <dd class="col-12 col-md-8 q-ma-none">{duration}</dd>
            </div>
          </dl>
          <div class="flex justify-end q-gap-sm q-mt-lg">
            <QBtn label="Cancel review" variant="flat" onclick={() => (reviewOpen = false)} />
            <QBtn
              label="Mark reviewed"
              variant="flat"
              onclick={() => {
                reviewed = true;
                reviewOpen = false;
              }}
            />
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Persistent Dialog">
        {#snippet sectionDescription()}
          <code>persistent</code> prevents dismissal through Escape or outside clicks. Provide explicit
          actions to close it. Persistence and modality are independent; this example combines both.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg">
          <div class="flex items-center q-gap-lg">
            <div class="example-copy">
              <h3 class="title-large q-ma-none">Courier collection</h3>
              <p class="body-medium q-mt-xs q-mb-none">
                Record the handoff with a deliberate choice.
              </p>
            </div>
            <QBtn
              label="Confirm collection"
              variant="tonal"
              onclick={() => (collectionOpen = true)}
            />
          </div>
          <p
            class="flex items-center q-gap-sm q-mt-lg q-mb-none body-medium text-on-surface-variant"
            role="status"
          >
            <QIcon name={collected ? "check_circle" : "inventory_2"} aria-hidden="true" />
            {collected ? "Collection recorded" : "Ready for collection"}
          </p>
        </div>

        <QDialog bind:value={collectionOpen} modal persistent aria-labelledby="collection-title">
          <h3
            id="collection-title"
            class="headline-small"
            tabindex="-1"
            {@attach collectionOpen ? focusDialogTitle : undefined}
          >
            Has the courier collected it?
          </h3>
          <p class="body-medium">
            Confirm only when the packed screenprint has been handed to the courier.
          </p>
          <div class="flex justify-end q-gap-sm q-mt-lg">
            <QBtn label="Not yet" variant="flat" onclick={() => (collectionOpen = false)} />
            <QBtn
              label="Record collection"
              variant="flat"
              onclick={() => {
                collected = true;
                collectionOpen = false;
              }}
            />
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Dialog Positioning">
        {#snippet sectionDescription()}
          Choose <code>default</code>, <code>top</code>, <code>right</code>, <code>bottom</code>, or
          <code>left</code>. Set the position before opening so the entrance animation starts from
          the selected edge. This example keeps the background interactive.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg flex items-center q-gap-lg">
          <QSelect
            label="Dialog position"
            options={[
              { label: "Center", value: "default" },
              { label: "Top", value: "top" },
              { label: "Right", value: "right" },
              { label: "Bottom", value: "bottom" },
              { label: "Left", value: "left" },
            ]}
            bind:value={position}
            emitValue
            disabled={positionedOpen}
            class="position-select"
          />
          <QBtn
            label="Open positioned dialog"
            variant="tonal"
            onclick={() => (positionedOpen = true)}
          />
        </div>

        <QDialog
          bind:value={positionedOpen}
          {position}
          aria-labelledby="positioned-title"
          class="positioned-dialog"
        >
          <h3
            id="positioned-title"
            class="headline-small"
            tabindex="-1"
            {@attach positionedOpen ? focusDialogTitle : undefined}
          >
            Handling notes
          </h3>
          <p class="body-medium">Keep these notes nearby while preparing the loan.</p>
          <ol class="handling-notes body-medium">
            <li>Use clean, dry hands when handling the frame.</li>
            <li>Keep the screenprint upright in its travel sleeve.</li>
            <li>Avoid direct sunlight while unpacking.</li>
          </ol>
          <div class="flex justify-end q-gap-sm q-mt-lg">
            <QBtn label="Close notes" variant="flat" onclick={() => (positionedOpen = false)} />
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Fullscreen Dialog">
        {#snippet sectionDescription()}
          <code>fullscreen</code> fills the viewport; add <code>modal</code> to block the background.
          This form edits a draft. Save applies it, while Cancel or Escape leaves the saved details unchanged.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg">
          <div class="flex items-center q-gap-lg">
            <div class="example-copy">
              <h3 class="title-large q-ma-none">Loan details</h3>
              <p class="body-medium q-mt-xs q-mb-none" role="status">{borrower} · {duration}</p>
            </div>
            <QBtn label="Edit loan details" icon="edit" variant="outlined" onclick={editLoan} />
          </div>
        </div>

        <QDialog bind:value={editorOpen} modal fullscreen aria-labelledby="editor-title">
          <form class="loan-editor flex column q-gap-lg q-mx-auto q-px-lg" onsubmit={saveLoan}>
            <header class="flex column q-gap-sm">
              <span class="label-medium text-on-surface-variant">THE SMALL MUSEUM · LOAN DESK</span>
              <h3
                id="editor-title"
                class="headline-medium q-ma-none"
                tabindex="-1"
                {@attach editorOpen ? focusDialogTitle : undefined}
              >
                Edit loan details
              </h3>
              <p class="body-large q-ma-none">The River Keeps Going · Collection record 014</p>
            </header>
            <div class="flex column q-gap-lg">
              <QInput label="Borrower" bind:value={draftBorrower} required />
              <QSelect
                label="Loan duration"
                options={["Two weeks", "One month", "Three months"]}
                bind:value={draftDuration}
              />
            </div>
            <p class="body-medium text-on-surface-variant q-ma-none">
              Changes stay in this draft until you save them.
            </p>
            <div class="flex justify-end q-gap-sm">
              <QBtn
                label="Cancel edit"
                type="button"
                variant="flat"
                onclick={() => (editorOpen = false)}
              />
              <QBtn
                label="Save details"
                type="submit"
                variant="flat"
                disabled={!draftBorrower.trim()}
              />
            </div>
          </form>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Programmatic Control">
        {#snippet sectionDescription()}
          Capture the component with <code>bind:this</code> to call <code>show()</code>,
          <code>hide()</code>, or <code>toggle()</code>. The bound value stays in sync, and
          <code>onclose</code> runs after each close. Stop propagation on external Show and Toggle buttons
          so they do not also count as outside clicks.
        {/snippet}

        <div class="dialog-example border text-on-surface q-pa-lg">
          <div class="flex q-gap-sm">
            <QBtn
              label="show()"
              variant="tonal"
              onclick={(event) => {
                event.stopPropagation();
                guide?.show();
              }}
            />
            <QBtn label="hide()" variant="outlined" onclick={() => guide?.hide()} />
            <QBtn
              label="toggle()"
              variant="outlined"
              onclick={(event) => {
                event.stopPropagation();
                guide?.toggle();
              }}
            />
          </div>
          <p
            class="flex items-center q-gap-sm q-mt-lg q-mb-none body-medium text-on-surface-variant"
            role="status"
          >
            {guideOpen ? "Dialog open" : "Dialog closed"} · Closes: {guideCloses}
          </p>
        </div>

        <QDialog
          bind:this={guide}
          bind:value={guideOpen}
          aria-labelledby="guide-title"
          onclose={() => (guideCloses += 1)}
        >
          <h3
            id="guide-title"
            class="headline-small"
            tabindex="-1"
            {@attach guideOpen ? focusDialogTitle : undefined}
          >
            Loan desk guide
          </h3>
          <p class="body-medium">
            This dialog was opened through a component method. Close it here or use the controls on
            the page.
          </p>
          <div class="flex justify-end q-gap-sm q-mt-lg">
            <QBtn label="Close with hide()" variant="flat" onclick={() => guide?.hide()} />
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Accessible Dialog Content" noCode>
        <p class="body-large">
          Give every dialog an accessible name with <code>aria-labelledby</code> or
          <code>aria-label</code>. These examples focus the heading once the opening animation
          begins, so keyboard navigation starts at the title. Keep a visible close or cancel action,
          and let long content scroll so actions remain reachable on small screens or with larger
          text.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .dialog-usage :global(.q-docs-section__header h5) {
    overflow-wrap: anywhere;
  }

  .dialog-preview {
    max-width: 360px;
  }

  .dialog-example {
    border-radius: 24px;
    background: var(--surface-container-low);
    overflow-wrap: anywhere;
  }

  .example-copy {
    flex: 1 1 240px;
    min-width: 0;
  }

  .dialog-facts dd {
    overflow-wrap: anywhere;
  }

  :global(.position-select) {
    flex: 1 1 240px;
    min-width: 0;
    max-width: 360px;
  }

  :global(.positioned-dialog.q-dialog--left),
  :global(.positioned-dialog.q-dialog--right) {
    width: min(400px, 100%);
    min-width: 0;
  }

  .handling-notes {
    padding-inline-start: 24px;

    li + li {
      margin-top: 12px;
    }
  }

  .loan-editor {
    width: min(100%, 720px);
    padding-block: 32px;
    overflow-wrap: anywhere;
  }

  @include mixins.up-to-sm {
    .dialog-example {
      @include mixins.padding("a-md");
    }
  }
</style>
