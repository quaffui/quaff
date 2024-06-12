<script lang="ts">
  import { isNumber } from "$lib/utils/number";
  import type { LinearProgressProps } from "./props";

  function width(val: number, reverse: boolean) {
    return reverse ? `translateX(100%) scale(-${val},1,1)` : `scale3d(${val},1,1)`;
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
  }: LinearProgressProps = $props();

  const normalized = $derived(value > 1 ? value / 100 : value);

  const kSize = $derived(isNumber(size) ? `${size}px` : size);

  const radius = $derived(noRound ? "0" : "0.75rem");
  const origin = $derived(reverse ? "0 100%" : "0 0");
  const transition = $derived(
    instantFeedback || indeterminate ? undefined : `transform ${animationSpeed}ms`
  );
  const trackTransform = $derived(width(buffer ?? 1, reverse));
  const indicatorTransform = $derived(width(+indeterminate || normalized, reverse));

  Quaff.classes("q-linear-progress", {
    classes: [props.class],
  });
  Quaff.classes("q-linear-progress__indicator", {
    bemClasses: { indeterminate },
    classes: ["absolute-full"],
  });
</script>

<div
  {...props}
  class="q-linear-progress"
  {...Quaff.classes}
  style:font-size={kSize}
  style:color="var(--{color}, {color})"
  style:border-radius={radius}
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="1"
  aria-valuenow={indeterminate ? undefined : normalized}
>
  <div
    class="q-linear-progress__track absolute-full"
    style:transition
    style:transform-origin={origin}
    style:background-color="var(--{trackColor})"
    style:transform={trackTransform}
  />

  <div
    class="q-linear-progress__indicator"
    {...Quaff.classes}
    style:transition
    style:transform={indicatorTransform}
    style:transform-origin={origin}
  />
</div>

<style lang="scss">
  @import "./linearProgress.scss";
</style>
