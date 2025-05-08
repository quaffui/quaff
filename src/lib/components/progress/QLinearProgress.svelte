<script lang="ts">
  import { useSize } from "$composables";
  import type { QLinearProgressProps } from "./props";

  function width(val: number, reverse: boolean) {
    return reverse ? `translateX(100%) scale3d(-${val}, 1, 1)` : `scale3d(${val}, 1, 1)`;
  }

  let {
    value = $bindable(0),
    buffer,
    reverse = false,
    noRound = false,
    size = "0.375em",
    color = "primary",
    animationSpeed = 600,
    instantFeedback = false,
    trackColor = "secondary-container",
    indeterminate = false,
    ...props
  }: QLinearProgressProps = $props();

  const normalized = $derived(value > 1 ? value / 100 : value);
  const normalizedBuffer = $derived(buffer && buffer > 1 ? buffer / 100 : buffer);

  const parsedColor = $derived(color.includes("#") ? color : `var(--${color}, ${color})`);
  const parsedTrackColor = $derived(
    trackColor.includes("#") ? trackColor : `var(--${trackColor}, ${trackColor})`
  );

  const qSize = $derived(useSize(size, "q-linear-progress"));

  const radius = $derived(noRound ? "0" : "0.75rem");
  const origin = $derived(reverse ? "0 100%" : "0 0");
  const transition = $derived(
    instantFeedback || indeterminate ? undefined : `transform ${animationSpeed}ms`
  );
  const trackTransform = $derived(width(normalizedBuffer ?? 1, reverse));
  const indicatorTransform = $derived(width(+indeterminate || normalized, reverse));

  Q.classes("q-linear-progress", {
    classes: [props.class],
  });

  Q.classes("q-linear-progress__indicator", {
    bemClasses: { indeterminate },
  });
</script>

<div
  {...props}
  class="q-linear-progress"
  style:font-size={qSize.style}
  style:border-radius={radius}
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={indeterminate ? undefined : normalized}
  data-quaff
>
  <div
    class="q-linear-progress__track absolute-full"
    style:transition
    style:transform-origin={origin}
    style:background-color={parsedTrackColor}
    style:transform={trackTransform}
  ></div>

  <div
    class="q-linear-progress__indicator"
    style:--q-indicator-color={parsedColor}
    style:transition
    style:transform={indicatorTransform}
    style:transform-origin={origin}
  ></div>
</div>
