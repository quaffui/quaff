<script lang="ts">
  import type { QCheckboxProps } from "./props";

  export let value: QCheckboxProps["value"] = false,
    label: QCheckboxProps["label"] = "",
    disable: QCheckboxProps["disable"] = false,
    userClasses: QCheckboxProps["userClasses"] = "";
  export { userClasses as class };
</script>

<label class="q-checkbox {userClasses}" class:q-checkbox--disabled={disable} {...$$restProps}>
  <input type="checkbox" bind:checked={value} disabled={disable} />
  <span>{label}</span>
</label>
