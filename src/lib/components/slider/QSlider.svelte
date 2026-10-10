<!--
@component
Sliders adjust a numeric value by moving a handle along a track. Use continuous movement or fixed steps to control precision.
-->

<script lang="ts">
  import QSliderBase from "./QSliderBase.svelte";
  import type { QSliderProps } from "./props";

  let { value = $bindable(0), centered = false, labelValue, ...props }: QSliderProps = $props();

  const labels = $derived([labelValue]);

  function updateValue(values: number[]) {
    value = values[0];
  }
</script>

<QSliderBase values={[value]} onvalues={updateValue} {centered} {labels} {...props} />
