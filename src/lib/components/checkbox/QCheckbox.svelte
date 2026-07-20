<script lang="ts">
  import type { QCheckboxProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(),
    indeterminate = $bindable(false),
    label = "",
    error = false,
    disabled = false,
    ...props
  }: QCheckboxProps = $props();
  // #endregion: --- Props

  Q.classes("q-checkbox", {
    bemClasses: {
      disabled,
      error,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-checkbox" aria-disabled={disabled || undefined} data-quaff>
  <input
    type="checkbox"
    bind:checked={value}
    bind:indeterminate
    {disabled}
    aria-checked={indeterminate ? "mixed" : undefined}
    aria-invalid={error || undefined}
  />
  <span class="q-checkbox__control" aria-hidden="true"></span>
  {#if label}<span class="q-checkbox__label">{label}</span>{/if}
</label>
