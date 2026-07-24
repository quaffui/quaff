<script lang="ts">
  import { QRangeDocs, QSliderDocs } from "$components/slider/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QCard, QRange, QSlider } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QSliderDocs, QRangeDocs] });

  let value = $state(35);
  let centeredValue = $state(-20);
  let range = $state<[number, number]>([25, 70]);
  let steppedValue = $state(40);
  let textSize = $state(3);
  let volume = $state(65);
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const textSizeLabels = ["Extra small", "Small", "Medium", "Large", "Extra large"] as const;
</script>

<svelte:head>
  <title>{pageTitle("QSlider")}</title>
</svelte:head>

<QDocs
  docName="QSlider"
  docDescription="Select single values or ranges with accessible Material 3 sliders."
>
  {#snippet display()}
    <QCard class="flex column q-gap-lg" style="width: min(28rem, 80%);">
      <QSlider value={64} aria-label="Preview value" />
      <QRange value={[20, 78]} minAriaLabel="Preview minimum" maxAriaLabel="Preview maximum" />
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Standard Slider">
        {#snippet sectionDescription()}
          Bind <code>value</code> to select one value between <code>min</code> and
          <code>max</code>. Changes take effect immediately.
        {/snippet}

        <div style="max-width: 36rem;">
          <div id="volume-label" class="title-small">Volume: {value}</div>
          <QSlider bind:value aria-labelledby="volume-label" />
        </div>
      </QDocsSection>

      <QDocsSection title="Centered Slider">
        {#snippet sectionDescription()}
          A centered slider visualizes negative and positive values around the middle of its range.
        {/snippet}

        <div style="max-width: 36rem;">
          <div id="balance-label" class="title-small">Balance: {centeredValue}</div>
          <QSlider
            bind:value={centeredValue}
            min={-100}
            max={100}
            centered
            label
            aria-labelledby="balance-label"
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Range Slider">
        {#snippet sectionDescription()}
          QRange exposes lower and upper handles. Give each handle a clear accessible label.
        {/snippet}

        <div style="max-width: 36rem;">
          <div class="title-small">Price: ${range[0]} – ${range[1]}</div>
          <QRange
            bind:value={range}
            minAriaLabel="Minimum price"
            maxAriaLabel="Maximum price"
            label
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Stops and Value Indicators">
        {#snippet sectionDescription()}
          Set <code>step</code> and <code>markers</code> for predetermined stops. Use
          <code>label</code> to show the active handle's value while it is pressed or keyboard-focused.
        {/snippet}

        <div style="display: grid; max-width: 36rem;">
          <QSlider bind:value={steppedValue} step={10} markers label aria-label="Brightness" />
          <QSlider
            bind:value={textSize}
            min={1}
            max={5}
            step={1}
            markers
            label
            labelValue={textSizeLabels[textSize - 1]}
            aria-label="Text size"
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Expressive Sliders">
        {#snippet sectionDescription()}
          Enable <code>expressive</code> for expanded sizes, vertical orientation, inset icons, and
          expressive motion, or pass <code>{`{ expressive: true }`}</code> to
          <code>Quaff.init()</code> for global expressive styling. Material 3 recommends keeping range
          sliders horizontal to reduce cognitive load.
        {/snippet}

        <div class="flex column q-gap-lg">
          {#each sizes as size (size)}
            <div class="flex items-center q-gap-md">
              <span class="label-large" style="width: 2rem;">{size.toUpperCase()}</span>
              <QSlider
                value={60}
                expressive
                {size}
                aria-label={`${size} slider`}
                style="max-width: 32rem;"
              />
            </div>
          {/each}

          <div class="flex items-center q-gap-xl" style="min-height: 14rem;">
            <QSlider
              bind:value={volume}
              expressive
              size="md"
              icon="volume_up"
              label
              aria-label="Volume with inset icon"
              style="max-width: 32rem;"
            />
            <QSlider value={70} expressive vertical size="md" label aria-label="Vertical level" />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Direction and States">
        {#snippet sectionDescription()}
          Use <code>reverse</code> to reverse the value direction. Read-only sliders remain focusable,
          while disabled sliders are removed from keyboard navigation.
        {/snippet}

        <div style="display: grid; max-width: 36rem;">
          <div class="flex items-center q-gap-md">
            <span id="reversed-slider-label" class="label-large" style="width: 6rem;">Reversed</span
            >
            <QSlider value={30} reverse aria-labelledby="reversed-slider-label" />
          </div>
          <div class="flex items-center q-gap-md">
            <span id="readonly-slider-label" class="label-large" style="width: 6rem;"
              >Read-only</span
            >
            <QSlider value={55} readonly aria-labelledby="readonly-slider-label" />
          </div>
          <div class="flex items-center q-gap-md">
            <span id="disabled-slider-label" class="label-large" style="width: 6rem;">Disabled</span
            >
            <QSlider value={70} disabled aria-labelledby="disabled-slider-label" />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          Each handle is a native range input. Tab moves focus to a handle, arrow keys adjust one
          value or stop, Space with an arrow adjusts one interval, and Home or End selects the first
          or last value. Associate sliders with visible labels using <code>aria-labelledby</code>,
          or provide <code>aria-label</code>.
        {/snippet}
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
