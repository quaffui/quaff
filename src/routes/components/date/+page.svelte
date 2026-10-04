<script lang="ts">
  import { resolve } from "$app/paths";
  import { createUtcDate, parseDateValue } from "$components/date/date";
  import { QDateDocs } from "$components/date/docs";
  import type { QDateRangeValue } from "$components/date/props";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import QLanguageExample from "$docs/QLanguageExample.svelte";
  import { QBtn, QDate, QIcon, QInput, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QDate — Date & Range Picker",
      "Select dates and date ranges with QDate for Svelte. Explore calendar and text input, date constraints, adaptive layouts, formatting, and localization."
    )
  );

  docsCtx.set({ snippets, componentDocs: QDateDocs });

  const DAY_IN_MS = 86_400_000;
  const DAY_RATE = 24;
  const METER_RATE = 4;
  const MAINTENANCE_DATES = ["2026-10-14", "2026-10-15", "2026-10-16"];
  const RANGE_FIELDS = [
    { key: "start", label: "Collect equipment" },
    { key: "end", label: "Return equipment" },
  ] as const;
  const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const PRICE_FORMAT = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  let rentalRange = $state<QDateRangeValue | null>({ start: "2026-10-09", end: "2026-10-12" });
  let includesMeter = $state(false);
  let inputRange = $state<QDateRangeValue | null>({ start: "2026-11-03", end: "2026-11-06" });
  let availableRange = $state<QDateRangeValue | null>({ start: "2026-10-19", end: "2026-10-22" });
  let dockedDate = $state<string | null>("16.10.2026");
  let dockedValidation = $state("");
  let adaptiveRange = $state<QDateRangeValue | null>({ start: "2026-10-23", end: "2026-10-26" });
  let adaptiveValidation = $state("");
  let pickupDate = $state<string | null>("2026-10-20");
  let controlledRange = $state<QDateRangeValue | null>({ start: "2026-11-12", end: "2026-11-14" });
  let controlledOpen = $state(false);
  let controlledPicker = $state<QDate<true>>();

  const rentalDays = $derived(countDays(rentalRange));
  const dailyRate = $derived(DAY_RATE + (includesMeter ? METER_RATE : 0));
  const rentalTotal = $derived(PRICE_FORMAT.format(rentalDays * dailyRate));

  function dateTimestamp(value: string, mask = "YYYY-MM-DD") {
    const date = parseDateValue(value, mask);

    if (!date) {
      return null;
    }

    return createUtcDate(date).getTime();
  }

  function describeDate(value: string | null | undefined, mask = "YYYY-MM-DD") {
    const timestamp = dateTimestamp(value ?? "", mask);

    return timestamp === null ? "Choose a date" : DATE_FORMAT.format(timestamp);
  }

  function countDays(value: QDateRangeValue | null) {
    const start = dateTimestamp(value?.start ?? "");
    const end = dateTimestamp(value?.end ?? "");

    if (start === null || end === null || end < start) {
      return 0;
    }

    return Math.round((end - start) / DAY_IN_MS) + 1;
  }

  function updateAdaptiveRange(
    endpoint: "start" | "end",
    value: string | number | null | undefined
  ) {
    adaptiveRange = {
      start: adaptiveRange?.start ?? "",
      end: adaptiveRange?.end ?? "",
      [endpoint]: String(value ?? ""),
    };
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="rental-preview surface">
      <div class="camera-art secondary-container" aria-hidden="true">
        <span class="film-label label-medium">35 MM · MANUAL FOCUS</span>
        <QIcon name="photo_camera" size="48px" />
        <span class="frame-number label-medium">FRAME 01</span>
      </div>
      <div class="rental-body">
        <div class="label-medium text-primary">LIGHTBOX RENTALS</div>
        <h2 class="headline-small q-mt-xs q-mb-sm">A few days in analogue</h2>
        <p class="body-medium text-on-surface-variant q-mt-none q-mb-md">
          A 35 mm camera and a 50 mm lens, ready to go.
        </p>
        <QDate range bind:value={rentalRange} label="Your rental dates" outlined />
        <div class="rental-total q-mt-md" aria-live="polite">
          <span class="body-medium">{rentalDays} days · {PRICE_FORMAT.format(dailyRate)} / day</span
          >
          <strong class="headline-small">{rentalTotal}</strong>
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Date Ranges">
        {#snippet sectionDescription()}
          <p>
            Set <code>range</code> and bind an object with <code>start</code> and <code>end</code>
            dates, or <code>null</code>. Both endpoints use the model <code>mask</code>, which
            defaults to <code>YYYY-MM-DD</code>.
          </p>
          <p>
            Select a start, then the same day or a later end. Choosing an earlier day restarts the
            range. The calendar highlights both endpoints and the days between them.
          </p>
        {/snippet}

        <div class="rental-panel">
          <div class="panel-heading">
            <QIcon name="camera" class="text-primary" size="32px" aria-hidden="true" />
            <div>
              <h6 class="title-large">Build your camera kit</h6>
              <p class="body-medium text-on-surface-variant q-ma-none">35 mm camera + 50 mm lens</p>
            </div>
          </div>
          <QDate range bind:value={rentalRange} label="Collect and return" filled />
          <QSwitch bind:value={includesMeter} label="Add a light meter · €4 / day" />
          <dl class="booking-details body-medium" aria-live="polite">
            <div>
              <dt>Collection</dt>
              <dd>{describeDate(rentalRange?.start)}</dd>
            </div>
            <div>
              <dt>Return</dt>
              <dd>{describeDate(rentalRange?.end)}</dd>
            </div>
            <div class="booking-total">
              <dt>{rentalDays} rental days</dt>
              <dd class="title-large">{rentalTotal}</dd>
            </div>
          </dl>
          <p class="body-small text-on-surface-variant q-ma-none">
            Collection and return days are included in this estimate.
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Text Input">
        {#snippet sectionDescription()}
          Open a modal directly in text entry with <code>defaultMode="input"</code>. Ranges show
          separate start and end fields. Users can switch between calendar and text entry unless
          <code>showModeToggle</code> is false. The input format follows <code>locale</code>.
        {/snippet}

        <div class="rental-panel">
          <div class="panel-heading">
            <QIcon name="receipt_long" class="text-tertiary" size="32px" aria-hidden="true" />
            <div>
              <h6 class="title-large">Dates already in your brief?</h6>
              <p class="body-medium text-on-surface-variant q-ma-none">
                Enter your studio booking.
              </p>
            </div>
          </div>
          <QDate
            range
            bind:value={inputRange}
            label="Studio rental"
            defaultMode="input"
            locale="en-GB"
            labels={{ startDate: "Collection date", endDate: "Return date" }}
            outlined
          />
          <div class="booking-note body-medium" aria-live="polite">
            <QIcon name="event_available" size="24px" aria-hidden="true" />
            <span>{countDays(inputRange)} days reserved in your plan</span>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Date Constraints">
        {#snippet sectionDescription()}
          <p>
            Limit dates with <code>min</code>, <code>max</code>, <code>yearRange</code>, and
            <code>disabledDates</code> (an array or predicate). Constraint values always use
            <code>YYYY-MM-DD</code>, regardless of the model mask.
          </p>
          <p>
            Every day in a range must be available, including the endpoints. A range crossing a
            disabled date cannot be confirmed.
          </p>
        {/snippet}

        <div class="rental-panel">
          <div class="panel-heading">
            <QIcon name="handyman" class="text-tertiary" size="32px" aria-hidden="true" />
            <div>
              <h6 class="title-large">Medium format, limited availability</h6>
              <p class="body-medium text-on-surface-variant q-ma-none">
                October 2026 rental calendar
              </p>
            </div>
          </div>
          <QDate
            range
            bind:value={availableRange}
            label="Medium-format rental"
            min="2026-10-01"
            max="2026-10-31"
            yearRange={[2026, 2026]}
            disabledDates={MAINTENANCE_DATES}
            firstDayOfWeek={1}
            locale="en-GB"
            outlined
          />
          <div class="booking-note tertiary-container body-medium">
            <QIcon name="build" size="24px" aria-hidden="true" />
            <span>In the workshop 14–16 October. Rentals must fit either side of maintenance.</span>
          </div>
          <p class="body-medium q-ma-none" aria-live="polite">
            Your plan: {describeDate(availableRange?.start)} – {describeDate(availableRange?.end)}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Docked and Adaptive">
        {#snippet sectionDescription()}
          <p>
            Use <code>variant="docked"</code> inside QInput's <code>append</code> snippet for an
            anchored picker. <code>adaptive</code> uses the same presentation at <code>sm</code>
            and above, then a full-screen modal on smaller screens.
          </p>
          <p>
            Composed inputs control their own labels, masks, and errors. For a range, bind each
            input to one endpoint and pass the complete object to QDate. Bind
            <code>validationMessage</code> to show validation in the surrounding fields.
          </p>
        {/snippet}

        <div class="example-grid">
          <div class="rental-panel">
            <div>
              <div class="label-medium text-primary">DOCKED · SINGLE DATE</div>
              <h6 class="title-large q-mt-xs">Lens collection</h6>
            </div>
            <QInput
              bind:value={dockedDate}
              label="Collection date"
              mask="##.##.####"
              fillMask
              hint="DD.MM.YYYY"
              error={Boolean(dockedValidation)}
              errorMessage={dockedValidation}
              outlined
            >
              {#snippet append()}
                <QDate
                  bind:value={dockedDate}
                  bind:validationMessage={dockedValidation}
                  variant="docked"
                  mask="DD.MM.YYYY"
                  locale="de-DE"
                />
              {/snippet}
            </QInput>
            <p class="body-medium q-ma-none" aria-live="polite">
              Ready at the counter: {describeDate(dockedDate, "DD.MM.YYYY")}
            </p>
          </div>
          <div class="rental-panel">
            <div>
              <div class="label-medium text-primary">ADAPTIVE · DATE RANGE</div>
              <h6 class="title-large q-mt-xs">A weekend with a wide-angle</h6>
            </div>
            {#snippet adaptivePicker()}
              <QDate
                range
                bind:value={adaptiveRange}
                bind:validationMessage={adaptiveValidation}
                variant="adaptive"
                label="Choose equipment rental dates"
                autoApply
              />
            {/snippet}
            {#each RANGE_FIELDS as field (field.key)}
              <QInput
                bind:value={
                  () => adaptiveRange?.[field.key] ?? "",
                  (value) => updateAdaptiveRange(field.key, value)
                }
                label={field.label}
                mask="####-##-##"
                hint="YYYY-MM-DD"
                error={Boolean(adaptiveValidation)}
                errorMessage={adaptiveValidation}
                append={field.key === "end" ? adaptivePicker : undefined}
                filled
              />
            {/each}
            <p class="body-medium q-ma-none" aria-live="polite">
              {countDays(adaptiveRange)} days with the wide-angle lens
            </p>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Single Dates">
        {#snippet sectionDescription()}
          Without <code>range</code>, the model remains a date string or <code>null</code>. The
          default modal variant renders its own field and becomes full-screen on small screens.
        {/snippet}

        <div class="rental-panel">
          <div class="panel-heading">
            <QIcon name="photo_library" class="text-secondary" size="32px" aria-hidden="true" />
            <div>
              <h6 class="title-large">Your negatives are ready</h6>
              <p class="body-medium text-on-surface-variant q-ma-none">
                Two rolls, 72 little moments.
              </p>
            </div>
          </div>
          <QDate bind:value={pickupDate} label="Film pickup" autoApply outlined />
          <p class="body-medium q-ma-none" aria-live="polite">
            Collection pencilled in for {describeDate(pickupDate)}.
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Formatting and Localization" noCode>
        {#snippet sectionDescription()}
          <p>
            QDate's <code>mask</code> controls the stored model; a composed QInput uses its own
            input mask. Keep their date order consistent, as in the docked example.
            <code>locale</code> controls display formatting, text entry, and the default first
            weekday. <code>firstDayOfWeek</code> overrides it, with Sunday as <code>0</code>.
          </p>
          <p>
            Switch languages to translate the picker labels, actions, and validation messages. See <a
              class="q-docs-link"
              href={resolve("/utils/quaff#language", {})}>available locales</a
            >
            for setup instructions.
          </p>
        {/snippet}

        <div class="rental-panel">
          <h6 class="title-large">A camera for your next trip</h6>
          <QLanguageExample>
            <QDate
              range
              value={{ start: "2026-11-09", end: "2026-11-13" }}
              outlined
              style="width: 100%"
            />
          </QLanguageExample>
        </div>
      </QDocsSection>

      <QDocsSection title="Programmatic Control and Labels">
        {#snippet sectionDescription()}
          Bind <code>open</code> or call <code>show()</code>, <code>hide()</code>, and
          <code>toggle()</code>. Customize the titles, action labels, or individual accessible
          labels with <code>labels</code>. Both <code>disabled</code> and <code>readonly</code>
          prevent opening.
        {/snippet}

        <div class="rental-panel">
          <div>
            <div class="label-medium text-primary">RENTAL REQUEST #024</div>
            <h6 class="title-large q-mt-xs">Fine-tune your collection dates</h6>
          </div>
          <QDate
            range
            bind:this={controlledPicker}
            bind:value={controlledRange}
            bind:open={controlledOpen}
            label="Requested rental"
            title="Plan your camera rental"
            inputTitle="Enter your rental dates"
            confirmLabel="Update request"
            cancelLabel="Keep dates"
            saveLabel="Update"
            labels={{ startDate: "Collect", endDate: "Return" }}
            outlined
          />
          <div class="example-actions">
            <QBtn
              variant="tonal"
              icon="edit_calendar"
              label="Edit request"
              onclick={controlledPicker?.show}
            />
            <QBtn variant="outlined" label="Toggle picker" onclick={controlledPicker?.toggle} />
          </div>
          <p class="body-small text-on-surface-variant q-ma-none" aria-live="polite">
            {controlledOpen ? "Editing your request" : "Your chosen dates are saved in this plan"}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Selection and Validation" noCode>
        {#snippet sectionDescription()}
          <p>
            Selections remain drafts until confirmed. Cancel and Escape leave the model unchanged.
            With <code>autoApply</code>, a single date commits immediately; a range commits only
            after both endpoints form a valid selection.
          </p>
          <p>
            Validation distinguishes invalid dates, unavailable dates, reversed ranges, and ranges
            containing unavailable days. Customize these messages with <code
              >labels.invalidDate</code
            >,
            <code>labels.unavailableDate</code>, <code>labels.invalidRange</code>, and
            <code>labels.unavailableRange</code>.
          </p>
        {/snippet}
      </QDocsSection>

      <QDocsSection title="Keyboard Navigation" noCode>
        {#snippet sectionDescription()}
          Arrow keys move by day or week. Page Up and Page Down change months; add Shift to change
          years. Enter or Space selects a date or range endpoint. Escape closes without applying the
          draft, and focus returns to the trigger.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .rental-preview {
    width: min(100%, 480px);
    max-height: 100%;
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
    overflow: auto;
  }

  .camera-art {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px 16px;
    min-height: 88px;
    padding: 16px 20px;
    background-image: repeating-linear-gradient(
      90deg,
      transparent 0 18px,
      color-mix(in srgb, currentColor 12%, transparent) 18px 30px,
      transparent 30px 40px
    );
    background-size: 100% 8px;
    background-repeat: repeat-x;
    background-position: bottom;
  }

  .camera-art :global(.q-icon) {
    grid-column: 2;
    grid-row: 1 / span 2;
  }

  .film-label {
    justify-self: start;
  }

  .frame-number {
    justify-self: start;
  }

  .rental-body {
    padding: 16px 20px;
  }

  .rental-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    width: 100%;
    max-width: 560px;
    min-width: 0;
    padding: 24px;
    border-radius: 20px;
    background-color: var(--surface-container-low);
    color: var(--on-surface);
  }

  .example-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    align-items: start;
    gap: 20px;
    max-width: 880px;
  }

  .panel-heading,
  .booking-note {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .panel-heading > div,
  .booking-note > span {
    min-width: 0;
  }

  .booking-note {
    padding: 16px;
    border-radius: 12px;
  }

  .booking-details {
    display: grid;
    gap: 12px;
    margin: 0;
  }

  .booking-details > div,
  .rental-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .booking-details dd {
    margin: 0;
  }

  .booking-total {
    padding-top: 16px;
    border-top: 1px solid var(--outline-variant);
    border-radius: 0;
  }

  .example-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 400px) {
    .rental-body,
    .rental-panel {
      padding: 16px;
    }
  }
</style>
