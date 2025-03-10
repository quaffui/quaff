<svelte:options runes={true} />

<script lang="ts">
  import { useSize } from "$lib/composables/useSize";
  import type { QLinearProgressProps } from "./props";

  function width(val: number, reverse: boolean) {
    return reverse ? `translateX(100%) scale3d(-${val}, 1, 1)` : `scale3d(${val}, 1, 1)`;
  }

  let {
    value = 0,
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

  const qSize = $derived(useSize(size, "q-linear-progress"));

  const radius = $derived(noRound ? "0" : "0.75rem");
  const origin = $derived(reverse ? "0 100%" : "0 0");
  const transition = $derived(
    instantFeedback || indeterminate ? undefined : `transform ${animationSpeed}ms`
  );
  const trackTransform = $derived(width(buffer ?? 1, reverse));
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
    style:background-color="var(--{trackColor}, {trackColor})"
    style:transform={trackTransform}
  ></div>

  <div
    class="q-linear-progress__indicator"
    style:--q-indicator-color="var(--{color}, {color})"
    style:transition
    style:transform={indicatorTransform}
    style:transform-origin={origin}
  ></div>
</div>
