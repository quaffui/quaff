<script lang="ts">
  import QSlider from "#components/slider/QSlider.svelte";
  import QRange from "#components/slider/QRange.svelte";

  const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
  const MARKER_DIRECTIONS = ["horizontal", "vertical", "reversed", "rtl"] as const;
  let value = $state(40);
  let verticalValue = $state(40);
  let rangeValue = $state<[number, number]>([25, 75]);
</script>

<main>
  <QSlider id="single" class="single" bind:value step={0} label aria-label="Level" />
  <QSlider
    id="vertical"
    class="vertical"
    bind:value={verticalValue}
    step={0}
    expressive
    vertical
    aria-label="Vertical level"
  />
  <QRange
    id="range"
    class="range"
    bind:value={rangeValue}
    step={5}
    label
    minAriaLabel="Minimum"
    maxAriaLabel="Maximum"
  />
  <QSlider id="rtl" class="rtl" value={40} dir="rtl" aria-label="RTL level" />
  <QSlider id="reversed" class="reversed" value={40} reverse aria-label="Reversed level" />
  <QSlider id="readonly" class="readonly" value={40} readonly aria-label="Read only level" />
  <QSlider
    id="disabled"
    class="disabled"
    value={40}
    step={20}
    markers
    disabled
    aria-label="Disabled level"
  />
  <QSlider
    class="readonly-vertical"
    value={40}
    expressive
    vertical
    readonly
    aria-label="Read only vertical level"
  />
  <QSlider
    class="disabled-vertical"
    value={40}
    expressive
    vertical
    disabled
    aria-label="Disabled vertical level"
  />

  {#each SIZES as size (size)}
    {#snippet icon()}
      <svg
        width={size === "xl" ? 32 : 24}
        height={size === "xl" ? 32 : 24}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9Z" /></svg
      >
    {/snippet}

    <QSlider
      class={`geometry-${size}`}
      value={50}
      step={0}
      expressive
      {size}
      {icon}
      aria-label={`${size} level`}
    />
  {/each}

  <QSlider
    class="dense-markers"
    value={41}
    markers
    expressive
    size="md"
    icon="volume_up"
    aria-label="Fine adjustments"
  />
  <QSlider
    class="dense-markers-vertical"
    value={41}
    step={0.1}
    markers
    expressive
    vertical
    aria-label="Fine vertical adjustments"
  />

  {#each [false, true] as reverse (reverse)}
    <QSlider
      class={`vertical-icon-${reverse}`}
      value={50}
      step={0}
      expressive
      vertical
      size="md"
      icon="volume_up"
      {reverse}
      aria-label="Vertical volume"
    />
  {/each}

  <QSlider class="centered" value={75} centered markers aria-label="Balance" />

  {#each MARKER_DIRECTIONS as direction (direction)}
    <QSlider
      class={`marker-values-${direction}`}
      value={50}
      markers={2}
      expressive
      vertical={direction === "vertical"}
      reverse={direction === "reversed"}
      dir={direction === "rtl" ? "rtl" : undefined}
      aria-label={`${direction} marked level`}
    />
  {/each}

  <QRange
    class="marker-values-range"
    value={[30, 70]}
    markers={2}
    minAriaLabel="Marked minimum"
    maxAriaLabel="Marked maximum"
  />

  <output id="values">{JSON.stringify({ value, verticalValue, rangeValue })}</output>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
    width: 448px;
    min-height: 2200px;
    padding: 64px;
    align-content: start;
  }

  output {
    overflow-wrap: anywhere;
  }

  :global(.dense-markers) {
    width: 300px;
  }
</style>
