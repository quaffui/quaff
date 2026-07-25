<script lang="ts">
  import { useColor, useSize } from "$composables";
  import { quaffConfig } from "$internal/quaffConfig";
  import { between } from "$utils";
  import { circularWavePath } from "./waves";
  import type { QCircularProgressProps } from "./props";

  const WAVE_COUNT = 9;

  // #region:    --- Props
  let {
    value = $bindable(0),
    indeterminate = false,
    size,
    fontSize = "0.25em",
    color = "primary",
    trackColor,
    thickness,
    min = 0,
    max = 100,
    angle = 0,
    noRound = false,
    instantFeedback = false,
    animationSpeed = 600,
    showValue = false,
    expressive = false,
    children = fallback,
    ...props
  }: QCircularProgressProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const id = $props.id();
  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const resolvedSize = $derived(size ?? (isExpressive ? "3rem" : "2.5rem"));
  const resolvedThickness = $derived(thickness ?? (isExpressive ? 1 / 6 : 0.2));
  const resolvedTrackColor = $derived(
    trackColor ?? (indeterminate && !isExpressive ? "transparent" : "secondary-container")
  );
  const qSize = $derived(useSize(resolvedSize, "q-circular-progress"));
  const parsedColor = $derived(useColor(color));
  const parsedTrackColor = $derived(useColor(resolvedTrackColor));

  const normalized = $derived(between(value, min, max));
  const range = $derived(max - min);
  const percentage = $derived(range > 0 ? ((normalized - min) / range) * 100 : 0);
  const strokeWidth = $derived(between(resolvedThickness, 0, 1) * 50);
  const waveAmplitude = $derived(
    isExpressive && (indeterminate || (percentage > 10 && percentage < 95)) ? 10 / 3 : 0
  );
  const hasDeterminateWave = $derived(waveAmplitude > 0 && !indeterminate);
  const radius = $derived(50 - strokeWidth / 2 - waveAmplitude);
  // The extra wave keeps a moving dashed segment on the open path so both caps stay round.
  const activePath = $derived(
    waveAmplitude
      ? circularWavePath(radius, waveAmplitude, WAVE_COUNT, hasDeterminateWave)
      : `M ${50 + radius} 50 A ${radius} ${radius} 0 1 1 ${50 - radius} 50 A ${radius} ${radius} 0 1 1 ${50 + radius} 50`
  );
  const wavePathOffset = $derived(hasDeterminateWave ? 100 / WAVE_COUNT : 0);
  const activePathLength = $derived(100 + wavePathOffset);
  const activeDasharray = $derived(`${percentage} ${activePathLength}`);
  const gap = $derived((4 / (isExpressive ? 48 : 40)) * 100);
  const trackGap = $derived(((gap + (noRound ? 0 : strokeWidth)) / (2 * Math.PI * radius)) * 100);
  const adaptiveTrackGap = $derived(Math.min(percentage, trackGap));
  const trackLength = $derived(Math.max(0, 100 - percentage - adaptiveTrackGap * 2));
  const trackOffset = $derived(-(percentage + adaptiveTrackGap));
  const activeTransition = $derived(
    instantFeedback || indeterminate
      ? undefined
      : `opacity ${animationSpeed}ms ease, stroke-dasharray ${animationSpeed}ms ease, stroke ${animationSpeed}ms ease`
  );
  const trackTransition = $derived(
    instantFeedback || indeterminate
      ? undefined
      : `opacity ${animationSpeed}ms ease, stroke-dasharray ${animationSpeed}ms ease, stroke-dashoffset ${animationSpeed}ms ease, stroke ${animationSpeed}ms ease`
  );
  // #endregion: --- Derived values

  Q.classes("q-circular-progress", {
    bemClasses: {
      expressive: isExpressive,
      indeterminate,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-circular-progress"
  style:--q-progress-size={qSize.style}
  role="progressbar"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={indeterminate ? undefined : normalized}
  data-quaff
>
  <svg
    class="q-circular-progress__svg"
    class:q-circular-progress__svg--wave={hasDeterminateWave}
    style:--q-progress-start-angle="{angle - 90}deg"
    style:--q-progress-end-angle="{angle + 990}deg"
    style:--q-progress-track-gap={trackGap}
    style:--q-progress-wave-path-offset="{wavePathOffset}px"
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <defs>
      <path
        id="{id}-active-path"
        class:q-circular-progress__wave={waveAmplitude}
        d={activePath}
        pathLength={activePathLength}
      />
    </defs>

    <g class="q-circular-progress__rotation">
      {#if resolvedTrackColor && resolvedTrackColor !== "transparent"}
        <circle
          class="q-circular-progress__track"
          fill="none"
          stroke={parsedTrackColor}
          stroke-width={strokeWidth}
          stroke-dasharray={indeterminate ? undefined : `${trackLength} 100`}
          stroke-dashoffset={indeterminate ? undefined : trackOffset}
          stroke-linecap={noRound ? "butt" : "round"}
          style:opacity={indeterminate || trackLength > 0 ? 1 : 0}
          style:transition={trackTransition}
          pathLength="100"
          cx="50"
          cy="50"
          r={radius}
        />
      {/if}

      {@render active()}
    </g>
  </svg>

  {#if showValue}
    <div
      class="q-circular-progress__text absolute-full flex flex-center"
      style:font-size={fontSize}
    >
      {@render children()}
    </div>
  {/if}
</div>

{#snippet fallback()}
  <div>{Math.round(normalized)}</div>
{/snippet}

{#snippet active()}
  <use
    href="#{id}-active-path"
    class="q-circular-progress__active"
    class:q-circular-progress__active--wave={hasDeterminateWave}
    fill="none"
    stroke={parsedColor}
    stroke-width={strokeWidth}
    stroke-dasharray={indeterminate ? undefined : activeDasharray}
    stroke-linecap={noRound ? "butt" : "round"}
    style:opacity={indeterminate || percentage > 0 ? 1 : 0}
    style:transition={activeTransition}
  />
{/snippet}
