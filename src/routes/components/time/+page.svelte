<script lang="ts">
  import { QTimeDocs } from "$components/time/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QInput, QTime } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QTimeDocs });

  let basicTime = $state<string | null>("14:30");
  let basicValidationMessage = $state("");
  let modalTime = $state<string | null>("09:30");
  let inputTime = $state<string | null>("18:45");
  let dockedTime = $state<string | null>("08:15");
  let dockedValidationMessage = $state("");
  let adaptiveTime = $state<string | null>("16:40");
  let adaptiveValidationMessage = $state("");
  let twelveHourTime = $state<string | null>("14:30");
  let twentyFourHourTime = $state<string | null>("14:30");
  let controlledTime = $state<string | null>("10:20");
  let controlledOpen = $state(false);
  let controlledPicker = $state<QTime>();
</script>

<svelte:head>
  <title>{pageTitle("QTime")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QInput
      bind:value={basicTime}
      label="Departure time"
      mask="time"
      fillMask
      error={Boolean(basicValidationMessage)}
      errorMessage={basicValidationMessage}
      filled
      style="width: min(22rem, 100%)"
    >
      {#snippet append()}
        <QTime
          bind:value={basicTime}
          bind:validationMessage={basicValidationMessage}
          variant="adaptive"
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
          The default variant renders its own field and opens in a dialog. Start with the clock dial
          or numeric time inputs; users can switch modes without losing their draft.
        {/snippet}

        <div class="flex q-gap-lg" style="flex-wrap: wrap">
          <div>
            <h6 class="q-mb-sm">Dial first</h6>
            <QTime bind:value={modalTime} label="Meeting time" outlined />
          </div>
          <div>
            <h6 class="q-mb-sm">Text input first</h6>
            <QTime
              bind:value={inputTime}
              label="Arrival time"
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
          dial. QInput remains the editable field and owns its label and mask.
        {/snippet}

        <QInput
          bind:value={dockedTime}
          label="Office hours"
          mask="time"
          fillMask
          hint="HH:mm"
          error={Boolean(dockedValidationMessage)}
          errorMessage={dockedValidationMessage}
          outlined
          style="max-width: 20rem"
        >
          {#snippet append()}
            <QTime
              bind:value={dockedTime}
              bind:validationMessage={dockedValidationMessage}
              variant="docked"
              format24h
            />
          {/snippet}
        </QInput>
      </QDocsSection>

      <QDocsSection title="Adaptive">
        {#snippet sectionDescription()}
          Adaptive uses the shared Quaff <code>sm</code> breakpoint: it is docked at
          <code>sm</code> and wider, and modal below it. Use it when one editable input must work across
          screen sizes.
        {/snippet}

        <QInput
          bind:value={adaptiveTime}
          label="Delivery time"
          mask="time"
          hint="Resize the viewport to change the picker presentation"
          error={Boolean(adaptiveValidationMessage)}
          errorMessage={adaptiveValidationMessage}
          filled
          style="max-width: 20rem"
        >
          {#snippet append()}
            <QTime
              bind:value={adaptiveTime}
              bind:validationMessage={adaptiveValidationMessage}
              variant="adaptive"
            />
          {/snippet}
        </QInput>
      </QDocsSection>

      <h4 class="q-mb-xl">Behavior and Customization</h4>

      <QDocsSection title="Clock Format and Locale">
        {#snippet sectionDescription()}
          <p>
            <code>locale</code> controls localized display and the default 12- or 24-hour cycle. Use
            <code>format24h</code>
            to override the locale. The bound model is always canonical
            <code>HH:mm</code>, from <code>00:00</code> through <code>23:59</code>.
          </p>
        {/snippet}

        <div class="flex q-gap-lg" style="flex-wrap: wrap">
          <QTime
            bind:value={twelveHourTime}
            label="12-hour clock"
            locale="en-US"
            format24h={false}
            outlined
          />
          <QTime
            bind:value={twentyFourHourTime}
            label="24-hour clock"
            locale="de-DE"
            format24h
            outlined
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Drafts and Validation" noCode>
        {#snippet sectionDescription()}
          <p>
            Without <code>autoApply</code>, selections stay as a draft until OK is pressed. Cancel
            and Escape discard that draft. With <code>autoApply</code>, completing minute selection
            commits and closes the picker.
          </p>
          <p>
            In a composed picker, bind QTime's <code>validationMessage</code> to QInput's
            <code>error</code> and <code>errorMessage</code>, as above. QInput's mask controls the
            editable shape; QTime validates the canonical model and the hour and minute ranges.
          </p>
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Programmatic Control and Labels">
        {#snippet sectionDescription()}
          <p>
            Bind <code>open</code> or call <code>show()</code> and <code>hide()</code> for
            programmatic control. Both <code>disabled</code> and <code>readonly</code> prevent opening.
          </p>
          <p>
            Customize <code>title</code>, <code>inputTitle</code>, confirm and cancel labels, or use
            <code>labels</code> to override accessible text and validation messages.
          </p>
        {/snippet}

        <div style="max-width: 22rem">
          <QTime
            bind:this={controlledPicker}
            bind:value={controlledTime}
            bind:open={controlledOpen}
            label="Appointment time"
            title="Choose appointment time"
            inputTitle="Enter appointment time"
            confirmLabel="Apply"
            cancelLabel="Back"
            labels={{ timeInput: "Appointment time", invalidTime: "Check the appointment time" }}
            outlined
          />

          <div class="flex q-gap-sm q-mt-md">
            <QBtn size="sm" label="Show" onclick={controlledPicker?.show} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Keyboard and Accessibility" noCode>
        {#snippet sectionDescription()}
          QTime follows the Material time-picker dialog pattern. Arrow keys move between dial values
          and AM/PM options, Enter or Space selects, and Tab follows the dialog's focus order. In
          text-input mode, Enter moves from hours to minutes and then validates the draft. Escape
          closes without applying it, and focus returns to the trigger. Picker labels, selected
          states, errors, and time changes are exposed to assistive technology.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
