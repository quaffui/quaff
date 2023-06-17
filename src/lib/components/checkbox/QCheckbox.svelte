<script lang="ts">
  import type { QCheckboxProps } from "./props";

  export let value: QCheckboxProps["value"] = false,
    label: QCheckboxProps["label"] = "",
    disable: QCheckboxProps["disable"] = false,
    userClasses: QCheckboxProps["userClasses"] = undefined;
  export { userClasses as class };
</script>

<label class={`checkbox ${userClasses}`} {...$$restProps}>
  <input type="checkbox" bind:checked={value} disabled={disable} />
  <span>{label}</span>
</label>
