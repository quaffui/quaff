<script lang="ts">
  import { useSize } from "$composables";
  import { between } from "$utils";
  import type { QCircularProgressProps } from "./props";

  type CircleParams = {
    cls: "track" | "indicator";
    offset: number;
    color: string;
    rounded?: boolean;
  };

  const radius = 50,
    diameter = 2 * radius,
    circumference = diameter * Math.PI,
    strokeDashArray = Math.round(circumference * 1000) / 1000;

  let {
    value = $bindable(0),
    indeterminate = false,
    size = "2em",
    fontSize = "0.25em",
    color = "primary",
    trackColor = "secondary-container",
    thickness = 0.2,
    min = 0,
    max = 100,
    angle = 0,
    noRound = false,
    instantFeedback = false,
    animationSpeed = 600,
    showValue = false,
    children = fallback,
    ...props
  }: QCircularProgressProps = $props();

  const qSize = $derived(useSize(size, "q-circular-progress"));

  const parsedColor = $derived(color.includes("#") ? color : `var(--${color}, ${color})`);
  const parsedTrackColor = $derived(
    trackColor.includes("#") ? trackColor : `var(--${trackColor}, ${trackColor})`
  );

  const svgStyle = $derived(`rotate3d(0, 0, 1, ${angle - 90}deg)`);
  const circleStyle = $derived(
    instantFeedback || indeterminate
      ? undefined
      : `stroke-dashoffset ${animationSpeed}ms ease 0s, stroke ${animationSpeed}ms ease`
  );

  const viewBox = $derived(diameter / (1 - thickness / 2));
  const viewBoxAttr = $derived(`${viewBox / 2} ${viewBox / 2} ${viewBox} ${viewBox}`);

  const normalized = $derived(between(value, min, max));
  const range = $derived(max - min);

  const strokeWidth = $derived((thickness / 2) * viewBox);
  const strokeDashOffset = $derived.by(() => {
    const dashRatio = (max - normalized) / range;
    const dashGap =
      !noRound && normalized < max && dashRatio < 0.25
        ? (strokeWidth / 2) * (1 - dashRatio / 0.25)
        : 0;

    return circumference * dashRatio + dashGap;
  });

  Q.classes("q-circular-progress", {
    bemClasses: {
      indeterminate,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-circular-progress"
  style:--size={qSize.style}
  role="progressbar"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={indeterminate ? undefined : normalized}
  data-quaff
>
  <svg
    class="q-circular-progress__svg"
    style:transform={svgStyle}
    viewBox={viewBoxAttr}
    aria-hidden="true"
  >
    {#if trackColor && trackColor !== "transparent"}
      {@render circle({
        cls: "track",
        offset: 0,
        color: parsedTrackColor,
      })}
    {/if}

    {@render circle({
      cls: "indicator",
      offset: strokeDashOffset,
      color: parsedColor,
      rounded: !noRound,
    })}
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

{#snippet circle({ offset, color, cls, rounded }: CircleParams)}
  <circle
    class="q-circular-progress__{cls}"
    style:transition={circleStyle}
    style:color
    fill="transparent"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-dasharray={strokeDashArray}
    stroke-dashoffset={offset}
    stroke-linecap={rounded ? "round" : undefined}
    cx={viewBox}
    cy={viewBox}
    r={radius}
  />
{/snippet}
