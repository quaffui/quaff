<script lang="ts">
  import { type QCheckboxProps } from "./types";

  export let value: QCheckboxProps["value"] = false,
    label: QCheckboxProps["label"] = "",
    className: QCheckboxProps["className"] = undefined;
  export { className as class };
</script>

<label class={`checkbox ${className}`} {...$$restProps}>
  <input type="checkbox" bind:checked={value} />
  <span>{label}</span>
</label>
