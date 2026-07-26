<script lang="ts">
  import { onMount } from "svelte";
  import { useColor, useSize } from "$composables";
  import { quaffConfig } from "$internal/quaffConfig";
  import { between } from "$utils";
  import { linearWavePath } from "./waves";
  import type { QLinearProgressProps } from "./props";

  type ActivePathParams = {
    mask?: boolean;
    secondary?: boolean;
  };

  // #region:    --- Props
  let {
    value = $bindable(0),
    buffer,
    reverse = false,
    noRound = false,
    size,
    color = "primary",
    animationSpeed = 600,
    instantFeedback = false,
    trackColor = "secondary-container",
    indeterminate = false,
    expressive = false,
    ...props
  }: QLinearProgressProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let width = $state(0);
  let height = $state(0);
  let transitionsReady = $state(false);
  let settledIndeterminate = $state<boolean>();
  // #endregion: --- Reactive variables

  // #region:    --- Lifecycle
  onMount(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => (transitionsReady = true)));
  });
  // #endregion: --- Lifecycle

  // #region:    --- Effects
  $effect(() => {
    const mode = indeterminate;
    let settleFrame = 0;
    const paintFrame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => (settledIndeterminate = mode));
    });

    return () => {
      cancelAnimationFrame(paintFrame);
      cancelAnimationFrame(settleFrame);
    };
  });
  // #endregion: --- Effects

  // #region:    --- Derived values
  const id = $props.id();
  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const qSize = $derived(
    useSize(size ?? (isExpressive ? "0.625rem" : "0.25rem"), "q-linear-progress")
  );
  const parsedColor = $derived(useColor(color));
  const parsedTrackColor = $derived(useColor(trackColor));

  const normalized = $derived(normalize(value));
  const normalizedBuffer = $derived(Math.max(normalized, normalize(buffer ?? 1)));
  const percentage = $derived(normalized * 100);
  const containerHeight = $derived(height || (isExpressive ? 10 : 4));
  const strokeWidth = $derived(Math.max(1, isExpressive ? containerHeight - 6 : containerHeight));
  const waveAmplitude = $derived(
    isExpressive && (indeterminate || (normalized > 0.1 && normalized < 0.95)) ? 3 : 0
  );
  const hasWave = $derived(waveAmplitude > 0);
  const hasDeterminateWave = $derived(hasWave && !indeterminate);
  const wavelength = $derived(indeterminate ? 20 : 40);
  const center = $derived(containerHeight / 2);
  const progressWidth = $derived(width || 240);
  const start = $derived(noRound ? 0 : strokeWidth / 2);
  const end = $derived(noRound ? progressWidth : Math.max(start, progressWidth - strokeWidth / 2));
  const activeEnd = $derived(between(progressWidth * normalized, start, end));
  const trackStart = $derived(
    between(
      progressWidth *
        (normalized + Math.min(normalized, (4 + (noRound ? 0 : strokeWidth)) / progressWidth)),
      start,
      end
    )
  );
  const trackEnd = $derived(between(progressWidth * normalizedBuffer, start, end));
  const trackRange = $derived(end - start || 1);
  const activeLength = $derived(((activeEnd - start) / trackRange) * 100);
  const capPathOffset = $derived(noRound ? 0 : (strokeWidth / 2 / trackRange) * 100);
  // The extra wave keeps a moving dashed segment on the open path so both caps stay round.
  const wavePathOffset = $derived(hasWave ? (wavelength / trackRange) * 100 : 0);
  const activePathLength = $derived(100 + wavePathOffset * (indeterminate && hasWave ? 2 : 1));
  const determinateTrackStart = $derived(normalized ? trackStart : start);
  const trackOffset = $derived(((determinateTrackStart - start) / trackRange) * 100);
  const trackLength = $derived(
    Math.max(0, ((trackEnd - determinateTrackStart) / trackRange) * 100)
  );
  const activePath = $derived(
    waveAmplitude
      ? linearWavePath(
          start - wavelength,
          indeterminate ? end + wavelength : end,
          center,
          waveAmplitude,
          wavelength
        )
      : `M ${start} ${center} H ${end}`
  );
  const trackPath = $derived(`M ${start} ${center} H ${end}`);
  const stopSize = $derived(Math.min(4, strokeWidth));
  const stopOffset = $derived(resolveStopOffset());
  const stopCenter = $derived(progressWidth - stopSize / 2 - stopOffset);
  const gapMaskWidth = $derived(strokeWidth + 8);
  const shouldAnimate = $derived(
    transitionsReady && !instantFeedback && !indeterminate && settledIndeterminate === indeterminate
  );
  const activeTransition = $derived(
    shouldAnimate
      ? `opacity ${animationSpeed}ms ease, stroke-dasharray ${animationSpeed}ms ease`
      : undefined
  );
  const trackTransition = $derived(
    shouldAnimate
      ? `opacity ${animationSpeed}ms ease, stroke-dasharray ${animationSpeed}ms ease, stroke-dashoffset ${animationSpeed}ms ease`
      : undefined
  );
  // #endregion: --- Derived values

  // #region:    --- Functions
  function normalize(progress: number) {
    return between(progress > 1 ? progress / 100 : progress, 0, 1);
  }

  function resolveStopOffset() {
    if (!isExpressive) {
      return Math.min((containerHeight - stopSize) / 2, 6);
    }

    if (strokeWidth === stopSize) {
      return 0;
    }

    return strokeWidth / 4;
  }
  // #endregion: --- Functions

  Q.classes("q-linear-progress", {
    bemClasses: {
      expressive: isExpressive,
      reverse,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-linear-progress"
  style:--q-progress-size={qSize.style}
  bind:clientWidth={width}
  bind:clientHeight={height}
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={indeterminate ? undefined : percentage}
  data-quaff
>
  <svg
    class="q-linear-progress__svg"
    class:q-linear-progress__svg--wave={hasWave}
    style:--q-progress-path-length="{activePathLength}px"
    style:--q-progress-cap-path-offset="{capPathOffset}px"
    style:--q-progress-wave-path-offset="{wavePathOffset}px"
    style:--q-progress-wavelength="{wavelength}px"
    viewBox="0 0 {width || 240} {containerHeight}"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <path
        id="{id}-active-path"
        class:q-linear-progress__wave={hasWave}
        d={activePath}
        pathLength={activePathLength}
      />
    </defs>

    <mask
      id="{id}-track-mask"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width={width || 240}
      height={containerHeight}
    >
      <rect width="100%" height="100%" fill="white" />

      {#if indeterminate}
        {@render active({ mask: true })}
        {@render active({ mask: true, secondary: true })}
      {/if}
    </mask>

    {#if trackColor && trackColor !== "transparent"}
      <path
        class="q-linear-progress__track"
        d={trackPath}
        mask={indeterminate ? `url(#${id}-track-mask)` : undefined}
        fill="none"
        stroke={parsedTrackColor}
        stroke-width={strokeWidth}
        stroke-dasharray={indeterminate ? undefined : `${trackLength} 100`}
        stroke-dashoffset={indeterminate ? undefined : -trackOffset}
        stroke-linecap={noRound ? "butt" : "round"}
        style:opacity={indeterminate || trackLength > 0 ? 1 : 0}
        style:transition={trackTransition}
        pathLength="100"
      />
    {/if}

    {@render active({})}
    {#if indeterminate}
      {@render active({ secondary: true })}
    {:else}
      <rect
        class="q-linear-progress__stop"
        x={stopCenter - stopSize / 2}
        y={center - stopSize / 2}
        width={stopSize}
        height={stopSize}
        rx={noRound ? 0 : stopSize / 2}
        fill={parsedColor}
      />
    {/if}
  </svg>
</div>

{#snippet active({ mask = false, secondary = false }: ActivePathParams)}
  <use
    href="#{id}-active-path"
    class="q-linear-progress__active"
    class:q-linear-progress__active--wave={hasDeterminateWave}
    class:q-linear-progress__active--indeterminate={indeterminate}
    class:q-linear-progress__active--secondary={secondary}
    fill="none"
    stroke={mask ? "black" : parsedColor}
    stroke-width={mask ? gapMaskWidth : strokeWidth}
    style:--q-progress-active-stroke-width="{mask ? gapMaskWidth : strokeWidth}px"
    stroke-dasharray={indeterminate ? undefined : `${activeLength}px ${activePathLength}px`}
    stroke-linecap={noRound ? "butt" : "round"}
    style:opacity={indeterminate || normalized > 0 ? 1 : 0}
    style:transition={indeterminate ? undefined : activeTransition}
  />
{/snippet}
