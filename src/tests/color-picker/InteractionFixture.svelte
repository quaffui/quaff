<script lang="ts">
  import QColorPicker from "$components/color-picker/QColorPicker.svelte";
  import "$css/components/color-picker.scss";

  const MASKS: Record<string, string> = { "6": String.raw`\#XXXXXX`, "8": String.raw`\#XXXXXXXX` };
  const params = new URLSearchParams(window.location.search);
  let value = $state<string | null>(params.get("value"));
  let externalValue = $state("rgb(17, 34, 51)");
</script>

<QColorPicker
  id="color"
  label="Color"
  bind:value
  format={params.get("format") === "hex" ? "hex" : "rgb"}
  alpha={params.get("alpha") === "true"}
  mask={MASKS[params.get("mask") ?? "6"]}
  fillMask={params.get("fill") !== "false"}
/>
<output id="value">{JSON.stringify(value)}</output>
<input id="external" aria-label="External value" bind:value={externalValue} />
<button id="update" onclick={() => (value = externalValue)}>Update externally</button>
