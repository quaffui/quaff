<script lang="ts">
  import { QCircularProgressDocs, QLinearProgressDocs } from "#components/progress/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import { QBtn, QCircularProgress, QLinearProgress, QSelect, QSlider, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "Linear & Circular Progress",
      "Show task progress with linear and circular indicators for Svelte. Compare measured and indeterminate progress, buffers, expressive styles, and custom ranges."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QLinearProgressDocs, QCircularProgressDocs] });

  const COLORS = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Tertiary", value: "tertiary" },
    { label: "Custom CSS color", value: "#b65b3e" },
  ];
  const TRACK_COLORS = ["secondary-container", "surface-container-highest", "transparent"];
  const TIMINGS = [200, 600, 1200];

  let previewValue = $state(60);
  let progress = $state(40);
  let expressive = $state(true);
  let isWaitingExpressive = $state(false);
  let direction = $state<"ltr" | "rtl">("ltr");
  let reverse = $state(false);
  let color = $state("primary");
  let trackColor = $state("secondary-container");
  let noRound = $state(false);
  let completedSteps = $state(3);
  let animationSpeed = $state(600);
  let instantFeedback = $state(false);
</script>

<QDocs
  docName="QProgress"
  docDescription="Progress indicators show task completion or ongoing work. Choose a linear bar or circular indicator, with measured progress or an indeterminate animation."
>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable preview needs keyboard access.) -->
    <div
      class="progress-preview column items-center q-gap-lg surface overflow-auto q-pa-lg"
      role="region"
      aria-label="Progress preview"
      tabindex="0"
    >
      <h2 class="title-medium q-ma-none">Uploading files</h2>
      <QCircularProgress
        value={previewValue}
        expressive
        size="6rem"
        showValue
        fontSize="1rem"
        aria-label="Upload progress, circular">{previewValue}%</QCircularProgress
      >
      <QLinearProgress
        value={previewValue / 100}
        expressive
        class="full-width"
        aria-label="Upload progress, linear"
      />
      <QBtn
        variant="tonal"
        label={previewValue === 100 ? "Reset progress" : "Advance progress"}
        onclick={() => (previewValue = previewValue === 100 ? 0 : Math.min(100, previewValue + 20))}
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Measured Progress">
      {#snippet sectionDescription()}
        Pass <code>value</code> when the amount of completed work is known. Linear progress accepts
        fractions from 0–1 or percentages above 1; circular progress uses 0–100 by default. Turn on
        <code>expressive</code> for wavy indicators.
      {/snippet}
      <QSwitch label="Expressive" bind:value={expressive} class="q-mb-md" />
      <div class="q-mb-lg">
        <label for="progress-value" class="label-large">Progress: {progress}%</label>
        <QSlider id="progress-value" bind:value={progress} step={10} label />
      </div>
      <div class="progress-example surface-container-low q-pa-lg">
        <div class="row q-gutter-y-lg q-gutter-x-md items-center">
          <div class="col-12 col-sm-8">
            <p class="body-medium q-mt-none q-mb-md">Downloading files · {progress}%</p>
            <QLinearProgress
              value={progress / 100}
              {expressive}
              aria-label="Download progress, linear"
            />
          </div>
          <div class="col-12 col-sm-4 flex flex-center">
            <QCircularProgress
              value={progress}
              {expressive}
              size="5rem"
              showValue
              fontSize="1rem"
              aria-label="Download progress, circular">{progress}%</QCircularProgress
            >
          </div>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Indeterminate Progress">
      {#snippet sectionDescription()}
        Use <code>indeterminate</code> when the total or completion percentage is unknown. Both
        indicators animate without a <code>value</code>.
      {/snippet}
      <QSwitch label="Expressive" bind:value={isWaitingExpressive} class="q-mb-lg" />
      <div class="progress-example surface-container-low q-pa-lg" aria-busy="true">
        <div class="flex no-wrap items-center q-gap-lg">
          <QCircularProgress
            indeterminate
            expressive={isWaitingExpressive}
            aria-label="Checking for updates, circular"
          />
          <p class="body-medium q-ma-none">Checking for updates…</p>
        </div>
        <QLinearProgress
          indeterminate
          expressive={isWaitingExpressive}
          class="q-mt-lg"
          aria-label="Checking for updates, linear"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Buffer and Direction">
      {#snippet sectionDescription()}
        <code>buffer</code> shows work prepared ahead of the completed portion, such as downloaded
        audio ahead of playback. Compare reading directions or use <code>reverse</code> to flip the fill.
      {/snippet}
      <div class="flex items-center q-gap-lg q-mb-lg">
        <QSelect label="Reading direction" options={["ltr", "rtl"]} bind:value={direction} />
        <QSwitch label="Reverse" bind:value={reverse} />
      </div>
      <div class="progress-example surface-container-low q-pa-lg" dir={direction}>
        <p class="body-medium q-mt-none q-mb-md">40% played · 75% buffered</p>
        <QLinearProgress
          value={0.4}
          buffer={0.75}
          {reverse}
          expressive={false}
          aria-label="Audio playback"
          aria-valuetext="40% played; 75% buffered"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Colors and Sizes">
      {#snippet sectionDescription()}
        Set <code>color</code> and <code>trackColor</code> with theme names or CSS colors.
        <code>size</code> sets the bar height or circle diameter; numbers use pixels and CSS lengths
        retain their units. <code>noRound</code> makes the ends square.
      {/snippet}
      <div class="flex items-center q-gap-lg q-mb-lg">
        <QSelect label="Indicator color" options={COLORS} emitValue bind:value={color} />
        <QSelect label="Track color" options={TRACK_COLORS} bind:value={trackColor} />
        <QSwitch label="Square ends" bind:value={noRound} />
      </div>
      <div class="progress-example surface-container-low q-pa-lg">
        <p class="body-small q-mt-none q-mb-md">12px bar</p>
        <QLinearProgress
          value={0.6}
          {color}
          {trackColor}
          {noRound}
          size="12px"
          expressive={false}
          aria-label="Styled linear progress"
        />
        <div class="flex justify-center items-center q-gap-lg q-mt-lg">
          {#each [48, 80, 112] as size (size)}
            <div class="column items-center q-gap-sm">
              <QCircularProgress
                value={60}
                {color}
                {trackColor}
                {noRound}
                {size}
                expressive={false}
                aria-label={`Styled circular progress, ${size}px`}
              />
              <span class="body-small">{size}px</span>
            </div>
          {/each}
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Custom Ranges and Labels">
      {#snippet sectionDescription()}
        Circular progress supports a custom <code>min</code> and <code>max</code>. Enable
        <code>showValue</code> to display the value; supply children to customize its label. Adjust
        <code>animationSpeed</code> for value transitions; <code>instantFeedback</code> skips them.
      {/snippet}
      <div class="flex items-center q-gap-lg q-mb-lg">
        <QSelect label="Transition duration (ms)" options={TIMINGS} bind:value={animationSpeed} />
        <QSwitch label="Instant feedback" bind:value={instantFeedback} />
      </div>
      <div class="progress-example flex items-center q-gap-lg surface-container-low q-pa-lg">
        <QCircularProgress
          value={completedSteps}
          min={0}
          max={8}
          size="6rem"
          showValue
          fontSize="1.25rem"
          {animationSpeed}
          {instantFeedback}
          aria-label="Setup progress"
          aria-valuetext={`${completedSteps} of 8 steps complete`}
        >
          {completedSteps} / 8
        </QCircularProgress>
        <div class="column items-start q-gap-md">
          <p class="body-medium q-ma-none">{completedSteps} of 8 steps complete</p>
          <QBtn
            variant="tonal"
            label={completedSteps === 8 ? "Reset steps" : "Next step"}
            onclick={() => (completedSteps = completedSteps === 8 ? 0 : completedSteps + 1)}
          />
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Accessibility" noCode>
      <p>
        Give each indicator an accessible name with <code>aria-label</code> or
        <code>aria-labelledby</code>. Use nearby text to explain the task and
        <code>aria-valuetext</code> when its number needs context.
      </p>
      <p>
        Measured indicators expose their value and range; indeterminate ones omit
        <code>aria-valuenow</code>. Indicators do not take keyboard focus. Keep status text visible
        so color and animation are not the only cues.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .progress-preview,
  .progress-example {
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .progress-preview {
    width: min(100%, 340px);
    max-height: 100%;
  }
</style>
