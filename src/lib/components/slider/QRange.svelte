<script lang="ts">
  import QSliderBase from "./QSliderBase.svelte";
  import type { QRangeProps, QRangeValue } from "./props";

  let {
    value = $bindable([0, 100]),
    minLabelValue,
    maxLabelValue,
    minAriaLabel,
    maxAriaLabel,
    ...props
  }: QRangeProps = $props();

  const labels = $derived([minLabelValue, maxLabelValue]);

  function updateValue(values: number[]) {
    value = values as QRangeValue;
  }
</script>

<QSliderBase
  values={value}
  onvalues={updateValue}
  {labels}
  ariaLabels={[minAriaLabel, maxAriaLabel]}
  range
  {...props}
/>
