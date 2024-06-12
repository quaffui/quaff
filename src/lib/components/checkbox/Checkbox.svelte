<script lang="ts">
  import type { CheckboxProps } from "./props";

  let {
    value = $bindable(false),
    label = "",
    disabled = false,
    ...props
  }: CheckboxProps = $props();

  Quaff.classes("q-checkbox", { classes: [props.class] });
</script>

<label {...props} class="q-checkbox" {...Quaff.classes}>
  <input type="checkbox" bind:checked={value} {disabled} />
  <span>{label}</span>
</label>

<style lang="scss">
  @import "./checkbox.scss";
</style>
