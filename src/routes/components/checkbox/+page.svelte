<script lang="ts">
  import { QCheckboxDocs } from "$components/checkbox/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBtn, QCheckbox, QIcon, QSeparator } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QCheckbox — Checkbox",
      "Collect checked, unchecked, and indeterminate choices with QCheckbox for Svelte. Learn value binding, disabled states, events, and accessibility."
    )
  );

  docsCtx.set({ snippets, componentDocs: QCheckboxDocs });

  const CHECKS = [
    {
      title: "Props on their marks",
      detail: "Moon, paper boat, and the tiny red suitcase.",
      icon: "inventory_2",
    },
    {
      title: "Sound cues rehearsed",
      detail: "Rain on the roof. One very small thunderstorm.",
      icon: "graphic_eq",
    },
    {
      title: "Costumes fastened",
      detail: "Three capes, six buttons, and no loose threads.",
      icon: "checkroom",
    },
  ] as const;

  let isTrunkReady = $state(false);
  let isTrunkMixed = $state(true);
  let prepared = $state([true, false, false]);
  let isConfirmed = $state(false);
  let hasSubmitted = $state(false);
  let isVenueOpen = $state(false);
  let lastChange = $state("Props checked by the morning crew.");

  const readyCount = $derived(prepared.filter((isPrepared) => isPrepared).length);
  const isFullyPrepared = $derived(readyCount === CHECKS.length);
  const isPartlyPrepared = $derived(readyCount > 0 && !isFullyPrepared);
  const hasConfirmationError = $derived(hasSubmitted && !isConfirmed);
  const canOpenDoors = $derived(isFullyPrepared && isConfirmed);
  const trunkStatus = $derived.by(() => {
    if (isTrunkMixed) {
      return "Some props still need a look.";
    }

    if (isTrunkReady) {
      return "Packed and ready for the next stage.";
    }

    return "Ready for another inventory check.";
  });

  function selectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    prepared = CHECKS.map(() => isChecked);
    isVenueOpen = false;
    lastChange = isChecked
      ? "Every department is ready."
      : "All checks cleared for another rehearsal.";
  }

  function recordChange(event: Event, title: string) {
    isVenueOpen = false;
    lastChange = `${title}: ${(event.target as HTMLInputElement).checked ? "ready" : "needs a check"}.`;
  }

  function openDoors(event: SubmitEvent) {
    event.preventDefault();
    hasSubmitted = true;
    isVenueOpen = canOpenDoors;
  }

  function resetRehearsal() {
    prepared = [true, false, false];
    isConfirmed = false;
    hasSubmitted = false;
    isVenueOpen = false;
    lastChange = "Reset for rehearsal. Props are already on their marks.";
  }
</script>

<QDocs docDescription="Check off tasks, select a whole group, and make partial progress visible.">
  {#snippet display()}
    <div class="trunk-preview surface q-pa-lg">
      <div
        class="mini-stage tertiary-container flex items-center justify-between no-overflow"
        aria-hidden="true"
      >
        <span class="stage-curtain tertiary"></span>
        <QIcon name="theater_comedy" size="48px" />
        <span class="stage-curtain tertiary"></span>
      </div>
      <div class="label-medium text-tertiary q-mt-md">LITTLE STRING THEATRE</div>
      <h2 class="title-large q-mt-xs q-mb-md">One trunk. A whole world.</h2>
      <QCheckbox
        label="Touring trunk checked"
        bind:value={isTrunkReady}
        bind:indeterminate={isTrunkMixed}
      />
      <p class="body-small q-mt-sm q-mb-none" role="status">
        {trunkStatus}
      </p>
      <QBtn
        variant="flat"
        label="Mark for recheck"
        class="q-mt-sm"
        onclick={() => {
          isTrunkReady = false;
          isTrunkMixed = true;
        }}
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Before the Curtain">
        {#snippet sectionDescription()}
          Bind each checkbox's <code>value</code> to its own boolean. Derive the group checkbox's
          <code>value</code> and <code>indeterminate</code> from the selected items: some checked
          means mixed, and all checked means complete. Its <code>onchange</code> handler selects or clears
          the whole group. Individual changes update the cue log below.
        {/snippet}

        <div class="stage-checklist surface q-pa-lg">
          <div class="show-heading flex items-center q-gap-md q-mb-lg">
            <div class="show-mark tertiary-container flex flex-center" aria-hidden="true">
              <QIcon name="theater_comedy" size="32px" />
            </div>
            <div>
              <div class="label-medium text-tertiary">SATURDAY MATINÉE · 14:00</div>
              <h3 class="headline-small q-mt-xs q-mb-none">The Moon in a Suitcase</h3>
            </div>
          </div>
          <div
            class="checklist-summary secondary-container flex items-center justify-between q-gap-md q-pa-md q-mb-lg"
          >
            <QCheckbox
              label="All departments ready"
              value={isFullyPrepared}
              indeterminate={isPartlyPrepared}
              onchange={selectAll}
            />
            <span class="label-large">{readyCount} / {CHECKS.length}</span>
          </div>
          <div class="flex column q-gap-lg">
            {#each CHECKS as check, index (check.title)}
              <div class="department-row flex items-start q-gap-lg">
                <QIcon name={check.icon} class="text-tertiary" aria-hidden="true" />
                <div class="department-copy">
                  <QCheckbox
                    label={check.title}
                    bind:value={prepared[index]}
                    onchange={(event) => recordChange(event, check.title)}
                  />
                  <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
                    {check.detail}
                  </p>
                </div>
              </div>
            {/each}
          </div>
          <QSeparator spacing="md" />
          <div class="readiness-line flex items-center">
            <QIcon
              name={isFullyPrepared ? "task_alt" : "pending_actions"}
              class="text-primary"
              aria-hidden="true"
            />
            <span class="title-medium"
              >{isFullyPrepared
                ? "The stage is ready."
                : `${CHECKS.length - readyCount} departments still to check.`}</span
            >
          </div>
          <p class="body-small text-on-surface-variant q-mt-sm q-mb-none" role="status">
            {lastChange}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Opening the Doors">
        {#snippet sectionDescription()}
          <code>error</code> marks an invalid checkbox; show an explanation alongside it. Complete the
          checks above and confirm the handover to open the doors. The reset action changes the bound
          values programmatically. This is a local demo; nothing is submitted.
        {/snippet}

        <form class="handover q-pa-lg" onsubmit={openDoors}>
          <div class="label-medium text-tertiary">STAGE MANAGER'S HANDOVER</div>
          <h3 class="title-large q-mt-xs q-mb-md">A little show, ready to go.</h3>
          <QCheckbox
            label="I have reviewed the stage checklist"
            bind:value={isConfirmed}
            error={hasConfirmationError}
            onchange={() => (isVenueOpen = false)}
          />
          {#if hasConfirmationError}
            <p class="body-medium text-error q-mt-sm q-mb-none" role="alert">
              Confirm the handover before opening the doors.
            </p>
          {/if}
          <div class="handover-actions flex q-my-lg">
            <QBtn
              type="submit"
              variant="tonal"
              icon="door_front"
              label={isVenueOpen ? "Doors are open" : "Open the doors"}
              disabled={isVenueOpen}
            />
            <QBtn
              type="button"
              variant="outlined"
              icon="restart_alt"
              label="Reset rehearsal"
              onclick={resetRehearsal}
            />
          </div>
          <p class="body-medium q-ma-none" role="status">
            {#if isVenueOpen}
              Welcome in! The first puppet is waiting in the wings.
            {:else if hasSubmitted && !isFullyPrepared}
              {CHECKS.length - readyCount} departments still need a check before the audience arrives.
            {:else if canOpenDoors}
              All checks complete. You can open the doors.
            {:else}
              {readyCount} of {CHECKS.length} departments checked · {isConfirmed
                ? "Handover confirmed"
                : "Handover awaiting confirmation"}
            {/if}
          </p>
        </form>
      </QDocsSection>

      <QDocsSection title="Checks from the Venue">
        {#snippet sectionDescription()}
          <code>disabled</code> prevents changes and removes a checkbox from keyboard navigation. Keep
          the reason visible. Disabled checkboxes can still show checked, unchecked, or mixed states;
          these venue records are separate from your rehearsal checklist.
        {/snippet}

        <div class="venue-notes surface q-pa-lg">
          <div class="label-medium text-tertiary">VENUE RECORD · READ ONLY</div>
          <h3 class="title-large q-mt-xs q-mb-lg">From the house crew</h3>
          <div class="venue-check">
            <QCheckbox label="Dressing room allocated" value={true} disabled />
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              Room 2 is reserved for your company.
            </p>
          </div>
          <div class="venue-check q-mt-lg">
            <QCheckbox label="Orchestra pit requested" value={false} disabled />
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              Not available in this studio theatre.
            </p>
          </div>
          <div class="venue-check q-mt-lg">
            <QCheckbox label="Tour dates confirmed" value={false} indeterminate disabled />
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              Two dates confirmed; the venue is arranging the third.
            </p>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Mixed State and Keyboard Access" noCode>
        {#snippet sectionDescription()}
          <p>
            <code>indeterminate</code> is independent of <code>value</code>. Use
            <code>bind:indeterminate</code> when you want to observe it clearing after a user toggles
            the checkbox, as in the touring-trunk preview. For select-all controls, recompute it from
            the group's current selection instead.
          </p>
          <p>
            Give every checkbox a visible <code>label</code>. Tab moves to an enabled checkbox and
            Space toggles it. The native input announces mixed and invalid states; accompany an
            error with readable text and keep surrounding status messages in a live region.
          </p>
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  code {
    overflow-wrap: anywhere;
  }

  .trunk-preview,
  .stage-checklist,
  .handover,
  .venue-notes {
    width: 100%;
    max-width: 640px;
    border-radius: 24px;
  }

  .trunk-preview {
    max-width: 352px;
    max-height: 100%;
    overflow: auto;
  }

  .mini-stage {
    flex-wrap: nowrap;
    height: 64px;
    border-radius: 16px 16px 8px 8px;
  }

  .stage-curtain {
    width: 40px;
    height: 100%;
    border-radius: 0 0 40px 0;
  }

  .stage-curtain:last-child {
    border-radius: 0 0 0 40px;
  }

  .show-heading > div:last-child {
    flex: 1 1 200px;
  }

  .show-mark {
    flex: none;
    width: 64px;
    height: 64px;
    border-radius: 16px 32px 16px 16px;
  }

  .checklist-summary {
    border-radius: 16px;
  }

  .department-row {
    flex-wrap: nowrap;
  }

  .department-copy {
    flex: 1;
    min-width: 0;
  }

  .department-copy p,
  .venue-check p {
    padding-inline-start: 33px;
    overflow-wrap: anywhere;
  }

  .readiness-line {
    flex-wrap: nowrap;
    gap: 12px;
  }

  .handover {
    background: var(--surface-container-low);
  }

  .handover-actions {
    gap: 12px;
  }

  @include mixins.up-to-sm {
    .trunk-preview,
    .stage-checklist,
    .handover,
    .venue-notes {
      padding: 16px;
    }
  }
</style>
