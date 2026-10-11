<script lang="ts">
  import { QCheckboxDocs } from "#components/checkbox/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import { QBtn, QCheckbox, QIcon } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QCheckbox — Checkbox",
      "Collect checked, unchecked, and indeterminate choices with QCheckbox for Svelte. Learn value binding, disabled states, events, and accessibility."
    )
  );

  docsCtx.set({ snippets, componentDocs: QCheckboxDocs });

  const PACKING_ITEMS = ["Water bottle", "Snacks", "Sun hat"];

  let shouldSendReminder = $state(true);
  let shouldSendWeeklyPicks = $state(false);
  let shouldIncludeGiftNote = $state(true);
  let selectedItems = $state([true, false, false]);
  let isConfirmed = $state(false);
  let hasSubmitted = $state(false);
  let isReserved = $state(false);

  const selectedCount = $derived(selectedItems.filter((isSelected) => isSelected).length);
  const isAllSelected = $derived(selectedCount === PACKING_ITEMS.length);
  const isSomeSelected = $derived(selectedCount > 0 && !isAllSelected);
  const hasConfirmationError = $derived(hasSubmitted && !isConfirmed);

  function selectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    selectedItems = PACKING_ITEMS.map(() => isChecked);
  }

  function reserveSeat(event: SubmitEvent) {
    event.preventDefault();
    hasSubmitted = true;
    isReserved = isConfirmed;
  }

  function resetReservation() {
    isConfirmed = false;
    hasSubmitted = false;
    isReserved = false;
  }
</script>

<QDocs>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable preview needs keyboard access.) -->
    <div
      class="checkbox-preview column items-start q-gap-lg surface overflow-auto q-pa-lg"
      role="region"
      aria-label="Checkbox preview"
      tabindex="0"
    >
      <div class="flex no-wrap items-center q-gap-md">
        <QIcon name="movie" size="32px" class="text-tertiary" aria-hidden="true" />
        <h2 class="title-large q-ma-none">Movie night</h2>
      </div>
      <QCheckbox label="Showtime reminder" bind:value={shouldSendReminder} />
      <QCheckbox label="Weekly film picks" bind:value={shouldSendWeeklyPicks} />
    </div>
  {/snippet}

  {#snippet usage()}
    <div class="checkbox-usage">
      <QDocsSection title="Value Binding">
        {#snippet sectionDescription()}
          Bind <code>value</code> to a boolean. Each checkbox controls an independent choice;
          clicking its <code>label</code> also toggles it.
        {/snippet}
        <div class="checkbox-example surface-container-low q-pa-lg">
          <div class="flex no-wrap items-center q-gap-md q-mb-lg">
            <QIcon name="redeem" size="32px" class="text-tertiary" aria-hidden="true" />
            <h3 class="title-medium q-ma-none">Gift options</h3>
          </div>
          <QCheckbox label="Add a gift note" bind:value={shouldIncludeGiftNote} />
          <p class="flex items-center q-gap-sm body-medium q-mt-lg q-mb-none" role="status">
            <span>{shouldIncludeGiftNote ? "Gift note included" : "No gift note"}</span>
            <code>{shouldIncludeGiftNote}</code>
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Select All">
        {#snippet sectionDescription()}
          Derive the parent checkbox's <code>value</code> and <code>indeterminate</code> from the
          group. A mixed state means some options are selected. The <code>onchange</code> handler selects
          or clears them all.
        {/snippet}
        <div class="checkbox-example surface-container-low q-pa-lg">
          <div class="flex no-wrap items-center q-gap-md q-mb-lg">
            <QIcon name="backpack" size="32px" class="text-tertiary" aria-hidden="true" />
            <h3 class="title-medium q-ma-none">Day-trip checklist</h3>
          </div>
          <div class="checkbox-summary secondary-container q-pa-md">
            <QCheckbox
              label="Pack everything"
              value={isAllSelected}
              indeterminate={isSomeSelected}
              onchange={selectAll}
            />
          </div>
          <div class="column items-start q-gap-lg q-mt-lg q-pl-lg">
            {#each PACKING_ITEMS as item, index (item)}
              <QCheckbox label={item} bind:value={selectedItems[index]} />
            {/each}
          </div>
          <p class="body-medium text-on-surface-variant q-mt-lg q-mb-none" role="status">
            {selectedCount} of {PACKING_ITEMS.length} packed{isAllSelected ? " · Ready to go." : ""}
          </p>
        </div>
        <p class="body-medium q-mt-md q-mb-none">
          <code>indeterminate</code> is independent of <code>value</code>. Use
          <code>bind:indeterminate</code> to observe it clearing when clicked; derive it from the selection
          for a select-all control.
        </p>
      </QDocsSection>

      <QDocsSection title="Disabled States">
        {#snippet sectionDescription()}
          <code>disabled</code> prevents changes and removes the checkbox from keyboard navigation. Checked,
          unchecked and mixed states remain visible.
        {/snippet}
        <div class="checkbox-example surface-container-low q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-lg">Team settings</h3>
          <div class="column items-start q-gap-lg">
            <QCheckbox label="Email invitations" value={true} disabled />
            <QCheckbox label="Public guest list" value={false} disabled />
            <QCheckbox label="Team permissions" indeterminate disabled />
          </div>
          <p class="body-medium text-on-surface-variant q-mt-lg q-mb-none">
            Managed by your administrator.
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Validation and Reset">
        {#snippet sectionDescription()}
          <code>error</code> marks an invalid choice. Try reserving without checking the box, then confirm
          and retry. Reset updates the bound value and clears the feedback.
        {/snippet}
        <form class="checkbox-example surface-container-low q-pa-lg" onsubmit={reserveSeat}>
          <div class="flex no-wrap items-center q-gap-md q-mb-lg">
            <QIcon name="event_seat" size="32px" class="text-tertiary" aria-hidden="true" />
            <h3 class="title-medium q-ma-none">Saturday workshop</h3>
          </div>
          <QCheckbox
            label="I can attend on Saturday"
            bind:value={isConfirmed}
            error={hasConfirmationError}
            onchange={() => (isReserved = false)}
          />
          {#if hasConfirmationError}
            <p class="body-medium text-error q-mt-md q-mb-none" role="alert">
              Confirm your attendance before reserving.
            </p>
          {/if}
          <div class="flex items-center q-gap-md q-mt-lg">
            <QBtn type="submit" variant="tonal" label="Reserve seat" />
            <QBtn type="button" variant="outlined" label="Reset" onclick={resetReservation} />
          </div>
          <p class="body-medium q-ma-none" class:q-mt-lg={isReserved} role="status">
            {isReserved ? "Seat reserved." : ""}
          </p>
        </form>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        <p>
          Give each checkbox a visible <code>label</code>. Tab reaches enabled checkboxes; Space
          toggles them. The native input announces checked, mixed and invalid states.
        </p>
        <p>
          Explain errors in text and why an option is disabled. Use a select-all checkbox only for
          related choices, and announce selection changes with nearby status text.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .checkbox-usage {
    overflow-wrap: anywhere;
  }

  .checkbox-preview,
  .checkbox-example {
    max-width: 640px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .checkbox-preview {
    width: min(100%, 340px);
    max-height: 100%;
  }

  .checkbox-summary {
    border-radius: 16px;
  }
</style>
