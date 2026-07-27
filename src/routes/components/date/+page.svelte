<script lang="ts">
  import { QDateDocs } from "$components/date/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QDate, QInput } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QDateDocs });

  let basicDate = $state<string | null>("2026/07/26");
  let basicValidationMessage = $state("");
  let modalDate = $state<string | null>("2026-08-17");
  let modalInputDate = $state<string | null>("2026-09-14");
  let dockedDate = $state<string | null>("03.10.2026");
  let dockedValidationMessage = $state("");
  let adaptiveDate = $state<string | null>("2026-12-24");
  let adaptiveValidationMessage = $state("");
  let constrainedDate = $state<string | null>("2026-07-27");
  let customizedDate = $state<string | null>("2026-10-05");
  let customizedOpen = $state(false);
  let customizedPicker = $state<QDate>();

  function disableWeekends(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    return weekday === 0 || weekday === 6;
  }
</script>

<svelte:head>
  <title>{pageTitle("QDate")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QInput
      bind:value={basicDate}
      label="Reservation date"
      mask="date"
      fillMask
      error={Boolean(basicValidationMessage)}
      errorMessage={basicValidationMessage}
      filled
      style="width: min(22rem, 100%)"
    >
      {#snippet append()}
        <QDate
          bind:value={basicDate}
          bind:validationMessage={basicValidationMessage}
          variant="adaptive"
          mask="YYYY/MM/DD"
          autoApply
        />
      {/snippet}
    </QInput>
  {/snippet}

  {#snippet usage()}
    <div>
      <h4 class="q-mb-xl">Variants</h4>

      <QDocsSection title="Modal">
        {#snippet sectionDescription()}
          The default variant renders its own field. It opens in a dialog and becomes full-screen on
          small screens.
        {/snippet}

        <div class="flex q-gap-lg" style="flex-wrap: wrap">
          <div>
            <h6 class="q-mb-sm">Calendar first</h6>
            <QDate bind:value={modalDate} label="Reservation date" outlined />
          </div>
          <div>
            <h6 class="q-mb-sm">Text input first</h6>
            <QDate
              bind:value={modalInputDate}
              label="Invoice date"
              defaultMode="input"
              locale="de-DE"
              filled
            />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Docked">
        {#snippet sectionDescription()}
          Use <code>variant="docked"</code> inside QInput's <code>append</code> snippet for an anchored
          picker. QInput remains the editable field and controls its label, mask, and validation.
        {/snippet}

        <QInput
          bind:value={dockedDate}
          label="Travel date"
          mask="##.##.####"
          fillMask
          hint="DD.MM.YYYY"
          error={Boolean(dockedValidationMessage)}
          errorMessage={dockedValidationMessage}
          outlined
          style="max-width: 20rem"
        >
          {#snippet append()}
            <QDate
              bind:value={dockedDate}
              bind:validationMessage={dockedValidationMessage}
              variant="docked"
              mask="DD.MM.YYYY"
              locale="de-DE"
            />
          {/snippet}
        </QInput>
      </QDocsSection>

      <QDocsSection title="Adaptive">
        {#snippet sectionDescription()}
          Adaptive is docked at <code>sm</code> and above, and full-screen below <code>sm</code>.
          Use it when the same input must work across screen sizes.
        {/snippet}

        <QInput
          bind:value={adaptiveDate}
          label="Delivery date"
          mask="####-##-##"
          hint="Resize the viewport to change the picker presentation"
          error={Boolean(adaptiveValidationMessage)}
          errorMessage={adaptiveValidationMessage}
          filled
          style="max-width: 20rem"
        >
          {#snippet append()}
            <QDate
              bind:value={adaptiveDate}
              bind:validationMessage={adaptiveValidationMessage}
              variant="adaptive"
            />
          {/snippet}
        </QInput>
      </QDocsSection>

      <h4 class="q-mb-xl">Features</h4>

      <QDocsSection title="Formatting and Localization" noCode>
        {#snippet sectionDescription()}
          <p>
            The QDate <code>mask</code> formats its model. In a composed picker, QInput uses its own input
            mask, so both masks must describe the same date order.
          </p>
          <p>
            <code>locale</code> controls date labels and the default first weekday;
            <code>firstDayOfWeek</code> overrides it with Sunday as <code>0</code>.
          </p>
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Date Constraints">
        {#snippet sectionDescription()}
          Use <code>min</code>, <code>max</code>, <code>yearRange</code>, and
          <code>disabledDates</code> to limit selection. Disabled dates can be an array or a
          predicate. Constraint values always use <code>YYYY-MM-DD</code>, regardless of the model
          mask.
        {/snippet}

        <QDate
          bind:value={constrainedDate}
          label="Appointment date"
          min="2026-07-01"
          max="2026-12-31"
          yearRange={[2026, 2027]}
          disabledDates={disableWeekends}
          locale="en-GB"
          firstDayOfWeek={1}
          hint="Weekdays from July through December 2026"
          outlined
          style="max-width: 20rem"
        />
      </QDocsSection>

      <QDocsSection title="Selection and Validation" noCode>
        {#snippet sectionDescription()}
          <p>
            <code>autoApply</code> commits a selection immediately. Otherwise, the selection stays
            as a draft until the user confirms it; Cancel and Escape leave the model unchanged.
            <code>defaultMode</code> chooses the opening view and <code>showModeToggle</code>
            controls whether users can switch views.
          </p>
          <p>
            For a composed picker, bind QDate's <code>validationMessage</code> to QInput's
            <code>error</code> and <code>errorMessage</code> props, as shown in the docked and
            adaptive examples. Invalid formats use <code>labels.invalidDate</code>; dates excluded
            by a constraint use <code>labels.unavailableDate</code>.
          </p>
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Programmatic Control and Labels">
        {#snippet sectionDescription()}
          <p>
            Bind <code>open</code> or call <code>show()</code>, <code>hide()</code>, and
            <code>toggle()</code> for programmatic control. Both <code>disabled</code> and
            <code>readonly</code> prevent opening.
          </p>
          <p>
            Customize <code>title</code>, <code>inputTitle</code>, the confirm, cancel, and save
            labels, or use <code>labels</code> to override accessible text and validation messages.
          </p>
        {/snippet}

        <div style="max-width: 22rem">
          <QDate
            bind:this={customizedPicker}
            bind:value={customizedDate}
            bind:open={customizedOpen}
            label="Arrival date"
            defaultMode="input"
            title="Choose arrival"
            inputTitle="Enter arrival"
            confirmLabel="Apply"
            cancelLabel="Back"
            saveLabel="Apply"
            labels={{ dateInput: "Arrival date", invalidDate: "Check the arrival date" }}
            outlined
          />

          <div class="flex q-gap-sm q-mt-md">
            <QBtn size="sm" label="Show" onclick={customizedPicker?.show} />
            <QBtn size="sm" label="Toggle" onclick={customizedPicker?.toggle} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Keyboard Navigation" noCode>
        {#snippet sectionDescription()}
          QDate follows the Material 3 date-picker and WAI-ARIA dialog patterns. Arrow keys move by
          day or week, Page Up and Page Down change month, Enter or Space selects, and Escape closes
          without applying the draft. Focus returns to the trigger.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
