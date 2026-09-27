<script lang="ts">
  import { QRadioDocs } from "#components/radio/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import { QBtn, QItem, QItemSection, QList, QRadio } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QRadio — Radio Button",
      "Choose one option from a group with QRadio for Svelte. Explore value binding, list integration, dynamic options, disabled states, and keyboard access."
    )
  );

  docsCtx.set({ snippets, componentDocs: QRadioDocs });

  const SESSION_OPTIONS = [
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "2h", label: "2 hours" },
  ] as const;
  const TABLE_OPTIONS = [
    { value: 2, label: "Window table · 2 seats", isDisabled: false },
    { value: 4, label: "Long table · 4 seats", isDisabled: false },
    { value: 6, label: "Large table · 6 seats · unavailable", isDisabled: true },
  ];
  let previewDuration = $state(60);
  let sessionLength = $state("1h");
  let seatCount = $state(4);
  let isRecurringBooking = $state(false);
  let contactMethod = $state("email");
  let submittedContactMethod = $state<string>();
  let selectionNote = $state("Choose an option to see its change event.");

  function resetSession() {
    sessionLength = "1h";
    selectionNote = "Reset to 1 hour without a change event.";
  }

  function submitPreferences(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    submittedContactMethod = String(formData.get("booking-contact") ?? "");
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="radio-preview surface overflow-auto q-pa-lg">
      <div class="label-medium text-primary q-mb-xs">BOOKING OPTIONS</div>
      <fieldset class="no-border column items-start q-gap-lg q-ma-none q-pa-none">
        <legend class="q-pa-none title-large q-mb-md">Session length</legend>
        <QRadio
          name="booking-preview"
          value={30}
          bind:selected={previewDuration}
          label="30 minutes"
        />
        <QRadio name="booking-preview" value={60} bind:selected={previewDuration} label="1 hour" />
      </fieldset>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Values, Binding and Events">
      {#snippet sectionDescription()}
        Give every option a <code>value</code>, share a <code>name</code>, and use the same
        <code>bind:selected</code> value for the group. Generate options with an <code>each</code>
        block. <code>onchange</code> responds to user selection; assigning the bound value updates the
        group without firing it.
      {/snippet}
      <div class="radio-example min-width-0 bg-surface-container-low q-pa-lg">
        <div class="column items-start q-gap-lg">
          <fieldset class="no-border column items-start q-gap-lg q-ma-none q-pa-none">
            <legend class="q-pa-none title-medium q-mb-lg">Session length</legend>
            {#each SESSION_OPTIONS as option (option.value)}
              <QRadio
                name="booking-session"
                value={option.value}
                bind:selected={sessionLength}
                label={option.label}
                onchange={() => (selectionNote = `${option.label} selected.`)}
              />
            {/each}
          </fieldset>
          <QBtn variant="tonal" label="Reset to 1 hour" onclick={resetSession} />
          <p class="body-medium text-on-surface-variant q-ma-none" role="status">{selectionNote}</p>
        </div>
        <p class="selection-result body-medium secondary-container q-pa-md q-mt-lg q-mb-none">
          Selected value: <code class="q-docs-code">{sessionLength}</code>
        </p>
      </div>
    </QDocsSection>

    <QDocsSection title="Numeric Values and Disabled Options">
      {#snippet sectionDescription()}
        Radio values can be numbers too. In a list, stretch the radio label to give each option a
        generous selection area. Use <code>preserveTabOrder</code> on the list to keep native radio
        keyboard navigation. <code>disabled</code> marks unavailable choices or a fixed selection.
      {/snippet}
      <div class="table-grid q-gap-lg">
        <div class="radio-example min-width-0 bg-surface-container-low q-pa-lg">
          <fieldset class="no-border q-ma-none q-pa-none">
            <legend class="q-pa-none title-medium q-mb-md">Choose a table</legend>
            <QList bordered preserveTabOrder>
              {#each TABLE_OPTIONS as option (option.value)}
                <QItem>
                  <QItemSection>
                    <QRadio
                      class="table-choice flex no-wrap full-width"
                      name="booking-table"
                      value={option.value}
                      bind:selected={seatCount}
                      label={option.label}
                      disabled={option.isDisabled}
                    />
                  </QItemSection>
                </QItem>
              {/each}
            </QList>
          </fieldset>
          <p class="body-medium text-on-surface-variant q-mt-md q-mb-none" role="status">
            Selected value: {seatCount} (number)
          </p>
        </div>
        <div class="radio-example min-width-0 bg-surface-container-low q-pa-lg">
          <h3 class="title-medium q-mt-none q-mb-md">Disabled selection</h3>
          <QRadio
            name="booking-status"
            value="confirmed"
            selected="confirmed"
            label="Reservation confirmed"
            disabled
          />
          <p class="body-medium text-on-surface-variant q-mb-none">
            This selection is fixed and cannot be changed.
          </p>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Boolean Values and Horizontal Layout">
      {#snippet sectionDescription()}
        Both <code>false</code> and <code>true</code> are valid radio values. Use Quaff's
        <code>flex</code> and gap helpers to arrange short choices horizontally; they wrap when space
        is limited.
      {/snippet}
      <div class="radio-example min-width-0 bg-surface-container-low q-pa-lg">
        <fieldset class="no-border flex q-gap-lg q-ma-none q-pa-none">
          <legend class="q-pa-none title-medium q-mb-lg">Booking frequency</legend>
          <QRadio
            name="booking-frequency"
            value={false}
            bind:selected={isRecurringBooking}
            label="One-off booking"
          />
          <QRadio
            name="booking-frequency"
            value={true}
            bind:selected={isRecurringBooking}
            label="Repeating booking"
          />
        </fieldset>
        <p
          class="selection-result body-medium secondary-container q-pa-md q-mt-lg q-mb-none"
          role="status"
        >
          Selected value: <code class="q-docs-code">{String(isRecurringBooking)}</code> (boolean)
        </p>
      </div>
    </QDocsSection>

    <QDocsSection title="Form Submission">
      {#snippet sectionDescription()}
        <code>name</code> is also the form field name. Only the checked, enabled radio is submitted.
        <code>FormData</code> reads its value as a string, even when the bound value is a number or boolean.
      {/snippet}
      <form
        class="radio-example min-width-0 column items-start q-gap-lg bg-surface-container-low q-pa-lg"
        onsubmit={submitPreferences}
      >
        <fieldset class="no-border column items-start q-gap-lg q-ma-none q-pa-none">
          <legend class="q-pa-none title-medium q-mb-lg">Booking updates</legend>
          <QRadio
            name="booking-contact"
            value="email"
            bind:selected={contactMethod}
            label="Email"
          />
          <QRadio
            name="booking-contact"
            value="phone"
            bind:selected={contactMethod}
            label="Phone"
          />
        </fieldset>
        <QBtn type="submit" variant="tonal" label="Submit preferences" />
        <p class="body-medium text-on-surface-variant q-ma-none" role="status">
          {#if submittedContactMethod}
            Submitted value: <code class="q-docs-code">{submittedContactMethod}</code>
          {:else}
            Submit to read the selected value.
          {/if}
        </p>
      </form>
    </QDocsSection>

    <QDocsSection title="Accessibility" noCode>
      <p>
        Group related radios in a <code>fieldset</code> with a <code>legend</code>. Give each option
        a visible <code>label</code> and share a <code>name</code> within the group.
      </p>
      <p>
        Tab enters or leaves a group; arrow keys move focus and select an option. Space selects the
        focused radio; Enter does not select it. Disabled options are skipped. Keep focus indicators
        visible and avoid nested interactive controls.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .radio-preview {
    width: min(100%, 340px);
    max-height: 100%;
    border-radius: 24px;
  }
  fieldset {
    min-inline-size: 0;
  }
  .table-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  }
  .radio-example {
    border-radius: 24px;
  }
  .radio-example :global(.table-choice) {
    min-height: 48px;
  }
  .selection-result {
    border-radius: 16px;
    overflow-wrap: anywhere;
  }
  @include mixins.up-to-sm {
    .radio-example {
      padding: 16px;
    }
  }
</style>
