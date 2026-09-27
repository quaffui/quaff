<script lang="ts">
  import { QRangeDocs, QSliderDocs } from "#components/slider/docs.js";
  import type { QSliderSize } from "#components/slider/props.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QBtn, QRange, QSelect, QSlider, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QSlider — Slider & Range Slider",
      "Select single values or ranges with QSlider for Svelte. Try centered sliders, stops, value indicators, expressive styles, and keyboard controls."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QSliderDocs, QRangeDocs] });

  const CONTRAST_LABELS = ["Low", "Reduced", "Normal", "Increased", "High"];
  const SIZES = ["xs", "sm", "md", "lg", "xl"];
  const STEPS = [
    { label: "Continuous", value: 0 },
    { label: "Single units", value: 1 },
    { label: "Five units", value: 5 },
  ];
  const MARKERS = [
    { label: "No stops", value: "none" },
    { label: "Follow step", value: "step" },
    { label: "Every ten units", value: "ten" },
  ];
  let volume = $state(35);
  let exposure = $state(0);
  let contrast = $state(3);
  let priceRange = $state<[number, number]>([40, 120]);
  let brightness = $state(65);
  let committedBrightness = $state(65);
  let expressive = $state(true);
  let size = $state<QSliderSize>("md");
  let reverse = $state(false);
  let readonly = $state(false);
  let disabled = $state(false);
  let shouldShowLabel = $state(true);
  let shouldUseCustomIcon = $state(false);
  let color = $state("tertiary");
  let trackColor = $state("tertiary-container");
  let step = $state(1);
  let markerMode = $state("none");
  const markers = $derived(markerMode === "ten" ? 10 : markerMode === "step");
  const imageFilter = $derived(`brightness(${2 ** exposure}) contrast(${0.4 + contrast * 0.2})`);

  $effect(() => {
    const increment = markerMode === "ten" ? 10 : step;

    if (increment > 0) {
      brightness = Math.round(brightness / increment) * increment;
    }
  });

  function resetAdjustments() {
    exposure = 0;
    contrast = 3;
  }
</script>

{#snippet renderHarbor()}
  <svg
    class="block full-width"
    viewBox="0 0 640 400"
    role="img"
    aria-label="Monochrome harbor illustration"
  >
    <rect width="640" height="400" fill="#b9bdc0" />
    <circle cx="482" cy="92" r="35" fill="#f4f1e8" />
    <path d="M0 212 86 158 155 202 261 128 340 188 412 154 515 208 640 144V400H0Z" fill="#80868b" />
    <path
      d="M0 264V218H56V188H88V242H154V198H174V162H182V198H202V244H268V204H318V264Z"
      fill="#414951"
    />
    <path
      d="M434 266V145H450V264M416 150 531 119 569 150H416M529 119V224"
      fill="none"
      stroke="#434b51"
      stroke-width="9"
    />
    <rect y="268" width="640" height="132" fill="#d0d2d0" />
    <path
      d="M0 298H192M248 298H530M43 322H299M379 322H640M0 353H119M171 353H440M501 353H640M60 380H368"
      stroke="#9ca3a6"
      stroke-width="5"
    />
    <path d="m303 282 28 33h145l30-33Z" fill="#303b43" />
    <path d="M361 282V223h44v59M375 222V201" fill="#626b71" stroke="#303b43" stroke-width="6" />
  </svg>
{/snippet}
{#snippet renderLampIcon()}
  <svg class="lamp-icon block" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    ><path
      d="M8 3h8l4 11H4L8 3Zm4 11v7m-5 0h10"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    /></svg
  >
{/snippet}

<QDocs
  docName="QSlider"
  docDescription="Sliders adjust a single value or the bounds of a range. Continuous movement, fixed steps, and value indicators help users make precise selections."
>
  {#snippet display()}
    <div class="slider-preview surface q-pa-lg">
      <label for="preview-volume" class="block title-medium q-mb-sm">Playback volume</label>
      <QSlider id="preview-volume" value={50} expressive size="md" icon="volume_up" />
    </div>
  {/snippet}
  {#snippet usage()}
    <QDocsSection title="Basic Usage">
      {#snippet sectionDescription()}
        Bind <code>value</code> to read and update a number. The default range is
        <code>0–100</code>; set <code>min</code> and <code>max</code> to change it.
      {/snippet}
      <div class="slider-example surface-container-low q-pa-lg">
        <label for="basic-volume" class="title-medium">Volume: {volume}%</label>
        <QSlider id="basic-volume" bind:value={volume} />
      </div>
    </QDocsSection>
    <QDocsSection title="Image Adjustments">
      {#snippet sectionDescription()}
        Use <code>centered</code> for adjustments around zero. Set <code>step</code> and
        <code>markers</code> for fixed stops, and <code>labelValue</code> to name them. These sliders
        update the image as you drag.
      {/snippet}
      <div class="image-adjustments q-gap-lg items-start">
        <figure class="image-adjustments__preview bg-surface-container-high q-ma-none q-pa-md">
          <div class="overflow-hidden no-border-radius" style:filter={imageFilter}>
            {@render renderHarbor()}
          </div>
          <figcaption class="body-small text-on-surface-variant q-pt-md">
            Exposure and contrast preview
          </figcaption>
        </figure>
        <div class="column min-width-0 q-gap-lg">
          <div>
            <label for="image-exposure" class="title-medium">Exposure</label>
            <p class="body-small text-on-surface-variant q-mt-xs q-mb-sm">
              {exposure > 0 ? "+" : ""}{exposure} stops
            </p>
            <div class="slider-room">
              <QSlider
                id="image-exposure"
                bind:value={exposure}
                min={-2}
                max={2}
                step={0.25}
                centered
                label
                labelValue={`${exposure} stops`}
              />
            </div>
          </div>
          <div>
            <label for="image-contrast" class="title-medium">Contrast</label>
            <p class="body-small text-on-surface-variant q-mt-xs q-mb-sm">
              {CONTRAST_LABELS[contrast - 1]}
            </p>
            <div class="slider-room">
              <QSlider
                id="image-contrast"
                bind:value={contrast}
                min={1}
                max={5}
                step={1}
                markers
                label
                labelValue={CONTRAST_LABELS[contrast - 1]}
              />
            </div>
          </div>
          <div>
            <QBtn variant="tonal" label="Reset adjustments" onclick={resetAdjustments} />
          </div>
        </div>
      </div>
    </QDocsSection>
    <QDocsSection title="Range Selection">
      {#snippet sectionDescription()}
        <code>QRange</code> binds a lower and upper value as a tuple. Name each handle with
        <code>minAriaLabel</code> and <code>maxAriaLabel</code>; customize their indicators with
        <code>minLabelValue</code> and <code>maxLabelValue</code>. Here they format prices.
      {/snippet}
      <div class="slider-example bg-surface-container-low q-pa-lg">
        <div class="flex justify-between items-center q-gap-md">
          <h3 class="title-medium q-ma-none">Price range</h3>
          <span class="title-medium">${priceRange[0]}–${priceRange[1]}</span>
        </div>
        <div class="slider-room">
          <QRange
            bind:value={priceRange}
            max={200}
            step={5}
            label
            minLabelValue={`$${priceRange[0]}`}
            maxLabelValue={`$${priceRange[1]}`}
            minAriaLabel="Minimum price"
            maxAriaLabel="Maximum price"
          />
        </div>
      </div>
    </QDocsSection>
    <QDocsSection title="Appearance and Interaction">
      {#snippet sectionDescription()}
        Compare track sizes, colors, stops and interaction states. Sizes above <code>xs</code>
        require <code>expressive</code>; inset icons appear at <code>md</code>, <code>lg</code> and
        <code>xl</code>. Omit <code>expressive</code> to inherit the setting from
        <code>Quaff.init()</code>.
      {/snippet}
      <div class="slider-controls items-start q-gap-md q-mb-lg">
        <QSelect
          label="Track size"
          options={SIZES}
          bind:value={size}
          disabled={!expressive}
          outlined
        />
        <QSelect
          label="Active color"
          options={["primary", "secondary", "tertiary"]}
          bind:value={color}
          outlined
        />
        <QSelect
          label="Inactive color"
          options={["primary-container", "secondary-container", "tertiary-container"]}
          bind:value={trackColor}
          outlined
        />
        <QSelect label="Value increment" options={STEPS} bind:value={step} emitValue outlined />
        <QSelect
          label="Stop indicators"
          options={MARKERS}
          bind:value={markerMode}
          emitValue
          outlined
        />
        <QSwitch label="Expressive styling" bind:value={expressive} />
        <QSwitch label="Reverse direction" bind:value={reverse} />
        <QSwitch label="Show value while dragging" bind:value={shouldShowLabel} />
        <QSwitch
          label="Use a custom inset icon"
          bind:value={shouldUseCustomIcon}
          disabled={!expressive || size === "xs" || size === "sm"}
        />
        <QSwitch label="Read-only" bind:value={readonly} />
        <QSwitch label="Disabled" bind:value={disabled} />
      </div>
      <p class="body-small text-on-surface-variant q-mt-none q-mb-md">
        Value indicators appear while dragging or when the handle has keyboard focus.
      </p>
      <div class="slider-example bg-surface-container-low q-pa-lg">
        <label for="slider-brightness" class="title-medium"
          >Brightness: {Math.round(brightness)}%</label
        >
        <div class="slider-room q-mt-md">
          <QSlider
            id="slider-brightness"
            bind:value={brightness}
            {expressive}
            {size}
            {reverse}
            {readonly}
            {disabled}
            label={shouldShowLabel}
            labelValue={`${Math.round(brightness)}%`}
            {color}
            {trackColor}
            {step}
            {markers}
            icon={shouldUseCustomIcon ? renderLampIcon : "light_mode"}
            onchange={() => (committedBrightness = Math.round(brightness))}
          />
        </div>
        <p class="body-small text-on-surface-variant q-mt-md q-mb-none" role="status">
          Last committed value: {committedBrightness}%.
        </p>
      </div>
      <p class="body-medium q-mt-lg q-mb-none">
        <code>{`step={0}`}</code> allows continuous pointer input. Numeric
        <code>markers</code>
        set both the stop spacing and the snapping increment, overriding
        <code>step</code>. Binding updates while dragging; <code>onchange</code>
        records the committed value.
        <code>readonly</code>
        retains focus and prevents edits; <code>disabled</code> also removes keyboard access.
      </p>
    </QDocsSection>
    <QDocsSection title="Vertical Sliders">
      {#snippet sectionDescription()}
        Use <code>vertical</code> with <code>expressive</code> and give the slider a height.
      {/snippet}
      <div class="slider-example bg-surface-container-low q-pa-lg">
        <div class="vertical-slider-stage flex no-wrap justify-center q-py-lg">
          <QSlider
            value={60}
            expressive
            vertical
            size="md"
            label
            class="full-height"
            aria-label="Vertical brightness"
          />
        </div>
      </div>
    </QDocsSection>
    <QDocsSection title="Accessibility" noCode>
      {#snippet sectionDescription()}
        Each handle is a native range input. Tab reaches it; arrow keys adjust its value, Home and
        End select the endpoints, and Space with an arrow moves one interval. Associate a visible
        label with a single slider using <code>for</code>/<code>id</code> or
        <code>aria-labelledby</code>.
        <code>labelValue</code> supplies the visual indicator and accessible value text for named stops.
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .slider-preview {
    width: min(100%, 352px);
    border-radius: 24px;
  }
  svg {
    height: auto;
  }
  .image-adjustments {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .image-adjustments__preview {
    border-radius: 4px;
  }
  .slider-example {
    border-radius: 24px;
  }
  .slider-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 224px), 1fr));
  }
  .slider-room {
    padding-inline: calc(2rem + 16px);
  }
  .vertical-slider-stage {
    height: 240px;
    padding-inline: 0 calc(3rem + 32px);
  }
  .lamp-icon {
    width: 24px;
    height: 24px;
    flex: none;
  }
  .slider-preview,
  .image-adjustments,
  .slider-example {
    overflow-wrap: anywhere;
  }
  @include mixins.up-to-md {
    .image-adjustments {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @include mixins.xs {
    .slider-example {
      padding: 16px;
    }
  }
</style>
