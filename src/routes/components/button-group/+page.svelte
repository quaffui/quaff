<script lang="ts">
  import { QBtnGroupDocs, QBtnToggleDocs } from "$components/button-group/docs";
  import type { QBtnGroupProps, QBtnToggleProps } from "$components/button-group/props";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBtn, QBtnGroup, QBtnToggle, QIconBtn, QSelect, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QBtnGroup — Button Groups",
      "Group related actions or select options with QBtnGroup and QBtnToggle. Try segmented buttons, connected groups, expressive sizes, and keyboard controls."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QBtnGroupDocs, QBtnToggleDocs] });

  type ToggleValue = QBtnToggleProps["value"];

  const FORECASTS = [
    { value: "now", label: "Now", temperature: 18 },
    { value: "later", label: "Later", temperature: 22 },
    { value: "night", label: "Night", temperature: 13 },
  ];
  const PERIODS = FORECASTS.map(({ value, label }) => ({ value, label }));
  const UNITS = [
    { label: "°C", value: 0 },
    { label: "°F", value: 1 },
  ];
  const METRICS = [
    { value: "wind", label: "Wind" },
    { value: "rain", label: "Rain" },
    { value: "uv", label: "UV" },
  ];
  const LAYERS = [
    { value: "cloud", icon: "cloud", "aria-label": "Cloud cover" },
    { value: "pollen", icon: "grass", "aria-label": "Pollen" },
    { value: "radar", icon: "radar", "aria-label": "Rain radar unavailable", disabled: true },
  ] satisfies QBtnToggleProps["options"];
  const LAYER_DETAILS = {
    cloud: "Cloud cover · 35%",
    pollen: "Pollen · moderate",
  };
  const SIZES = ["xs", "sm", "md", "lg", "xl"];
  const VARIANTS = ["tonal", "filled", "outlined", "elevated"];

  let unit = $state<ToggleValue>(0);
  let period = $state<ToggleValue>("now");
  let expressive = $state(true);
  let connected = $state(true);
  let spread = $state(true);
  let size = $state<NonNullable<QBtnGroupProps["size"]>>("sm");
  let shape = $state<NonNullable<QBtnGroupProps["shape"]>>("round");
  let variant = $state<NonNullable<QBtnToggleProps["variant"]>>("tonal");
  let selectedMetrics = $state<ToggleValue>(["wind", "rain"]);
  let canClearSelection = $state(false);
  let layer = $state<ToggleValue>("cloud");
  let isStationLocked = $state(false);
  let isLogPinned = $state(false);
  let loggedReadingCount = $state(0);

  const forecast = $derived(FORECASTS.find(({ value }) => value === period) ?? FORECASTS[0]);
  const temperature = $derived(
    unit === 1 ? Math.round((forecast.temperature * 9) / 5 + 32) : forecast.temperature
  );
  const unitLabel = $derived(unit === 1 ? "°F" : "°C");
  const visibleMetrics = $derived(
    METRICS.filter(({ value }) => Array.isArray(selectedMetrics) && selectedMetrics.includes(value))
  );
  const layerDetail = $derived(
    layer === "cloud" || layer === "pollen" ? LAYER_DETAILS[layer] : "No extra layer selected."
  );

  function keepRequiredMetric() {
    if (!canClearSelection && (!Array.isArray(selectedMetrics) || selectedMetrics.length === 0)) {
      selectedMetrics = ["wind"];
    }
  }
</script>

<QDocs
  docName="Button groups"
  docDescription="Choose a view, combine useful readings, or keep related actions together."
>
  {#snippet display()}
    <div class="group-preview surface q-pa-lg">
      <p class="label-medium text-tertiary q-mt-none q-mb-md">ROOFTOP FORECAST · UNITS</p>
      <div class="group-scroll q-pa-sm">
        <QBtnToggle
          expressive={false}
          options={UNITS}
          bind:value={unit}
          aria-label="Temperature unit"
        />
      </div>
      <p class="body-medium q-mt-md q-mb-none" role="status">Temperature unit: {unitLabel}</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Single Selection">
        {#snippet sectionDescription()}
          <code>QBtnToggle</code> manages selection from an <code>options</code> array. Give options
          unique string or number values and bind <code>value</code> to change the view. A single choice
          stays selected by default. Try baseline segmented buttons or expressive groups; large groups
          scroll inside the example.
        {/snippet}
        <div class="group-controls flex items-center q-gap-md q-mb-md">
          <QSwitch label="Expressive" bind:value={expressive} />
          <QSwitch label="Connected" bind:value={connected} disabled={!expressive} />
          <QSwitch label="Fill available width" bind:value={spread} />
        </div>
        <div class="group-controls flex items-center q-gap-md q-mb-md">
          <QSelect
            label="Group size"
            bind:value={size}
            options={SIZES}
            disabled={!expressive}
            outlined
          />
          <QSelect
            label="Button shape"
            bind:value={shape}
            options={["round", "squared"]}
            disabled={!expressive}
            outlined
          />
          <QSelect
            label="Button variant"
            bind:value={variant}
            options={VARIANTS}
            disabled={!expressive}
            outlined
          />
        </div>
        <div class="group-example surface q-pa-lg">
          <div class="group-scroll q-pa-sm">
            <QBtnToggle
              {expressive}
              {connected}
              {spread}
              {size}
              {shape}
              {variant}
              options={PERIODS}
              bind:value={period}
              aria-label="Forecast period"
            />
          </div>
          <p class="body-medium q-mt-md q-mb-none" role="status">
            {forecast.label}: {temperature}{unitLabel}
          </p>
        </div>
        <p class="body-medium q-mt-md">
          Baseline groups are always connected, with a 40px minimum height. Expressive groups
          support <code>xs</code> through <code>xl</code>, round or squared shapes, and four
          variants. When omitted, <code>expressive</code> follows <code>Quaff.init()</code>'s
          setting;
          <code>spread</code> defaults to true for expressive connected groups and false otherwise.
        </p>
      </QDocsSection>

      <QDocsSection title="Multiple and Optional Selection">
        {#snippet sectionDescription()}
          Use <code>multiple</code> with an array of values. Multiple groups allow an empty
          selection by default; <code>{"clearable={false}"}</code> preserves the final selected
          option. Initialize a required group with a valid value. A clearable single group returns
          <code>undefined</code> when its selected option is pressed again.
        {/snippet}
        <QSwitch
          label="Allow an empty selection"
          bind:value={canClearSelection}
          onchange={keepRequiredMetric}
          class="q-mb-md"
        />
        <div class="group-example surface q-pa-lg">
          <div class="group-scroll q-pa-sm">
            <QBtnToggle
              expressive
              multiple
              clearable={canClearSelection}
              options={METRICS}
              bind:value={selectedMetrics}
              aria-label="Visible weather readings"
            />
          </div>
          <p class="body-medium q-mt-md q-mb-none" role="status">
            Readings: {visibleMetrics.map((metric) => metric.label).join(", ") || "None selected"}
          </p>
          <h3 class="title-small q-mt-lg q-mb-sm">Optional weather layer</h3>
          <div class="group-scroll q-pa-sm">
            <QBtnToggle
              expressive
              connected={false}
              clearable
              spread={false}
              options={LAYERS}
              bind:value={layer}
              aria-label="Optional weather layer"
            />
          </div>
          <p class="body-medium q-mt-md q-mb-none" role="status">{layerDetail}</p>
          <p class="body-small text-on-surface-variant q-mt-md q-mb-none">
            Rain radar is offline. Its option stays visible and disabled.
          </p>
        </div>
        <p class="body-medium q-mt-md">
          <code>{"connected={false}"}</code> separates expressive toggle buttons. Icon-only options
          need an <code>aria-label</code>; set <code>disabled</code> on an individual option when it is
          unavailable.
        </p>
      </QDocsSection>

      <QDocsSection title="Related Actions">
        {#snippet sectionDescription()}
          Put <code>QBtn</code> and <code>QIconBtn</code> directly inside <code>QBtnGroup</code> for independent
          actions. The group shares its size, shape, expressive mode, and disabled state with them; each
          button keeps its own variant and action. Expressive action groups use separate buttons by default.
          Toggle the maintenance lock to disable the whole group.
        {/snippet}
        <QSwitch label="Maintenance lock" bind:value={isStationLocked} class="q-mb-md" />
        <div class="group-example surface q-pa-lg">
          <div class="group-scroll q-pa-sm">
            <QBtnGroup
              expressive
              size="md"
              shape="squared"
              disabled={isStationLocked}
              aria-label="Observation actions"
              style="min-width: max-content"
            >
              <QBtn
                label="Log reading"
                icon="add"
                variant="filled"
                disabled={loggedReadingCount === 5}
                onclick={() => (loggedReadingCount += 1)}
              />
              <QIconBtn
                icon="keep"
                variant="tonal"
                aria-label="Pin observation log"
                bind:selected={isLogPinned}
              />
              <QIconBtn
                icon="delete"
                variant="outlined"
                aria-label="Clear observation log"
                disabled={loggedReadingCount === 0}
                onclick={() => (loggedReadingCount = 0)}
              />
            </QBtnGroup>
          </div>
          <p class="body-medium q-mt-md q-mb-none" role="status">
            {#if isStationLocked}
              Station locked while the sensors are serviced.
            {:else}
              {loggedReadingCount} / 5 readings logged{isLogPinned ? " · Pinned" : ""}.
            {/if}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Keyboard and Selection" noCode>
        {#snippet sectionDescription()}
          Each enabled button is a Tab stop; Space and Enter activate it. Selection is announced
          through <code>aria-pressed</code>. Keep labels stable as selections change, and name each
          group with <code>aria-label</code>. The container itself is not a focus stop. See the
          Material guidance for
          <a class="q-docs-link" href="https://m3.material.io/components/button-groups/overview"
            >button groups</a
          >
          and
          <a class="q-docs-link" href="https://m3.material.io/components/segmented-buttons/overview"
            >segmented buttons</a
          >.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .group-controls :global(.q-switch) {
    max-width: 100%;
  }

  .group-preview,
  .group-example {
    width: 100%;
    max-width: 680px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .group-preview {
    max-width: 352px;
    max-height: 100%;
    overflow: auto;
  }

  .group-controls {
    max-width: 680px;
  }

  .group-controls :global(.q-select) {
    flex: 1 1 160px;
    min-width: 0;
  }

  .group-scroll {
    max-width: 100%;
    overflow: auto;
  }

  @media (max-width: 599px) {
    .group-preview,
    .group-example {
      padding: 16px;
    }
  }
</style>
