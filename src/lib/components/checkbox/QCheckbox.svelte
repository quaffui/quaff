<script lang="ts">
  import type { QCheckboxProps } from "./props";

  // #region:    --- Props
  let { value = $bindable(), label = "", disabled = false, ...props }: QCheckboxProps = $props();
  // #endregion: --- Props

  Q.classes("q-checkbox", {
    bemClasses: {
      disabled,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-checkbox" aria-disabled={disabled || undefined} data-quaff>
  <input type="checkbox" bind:checked={value} {disabled} />
  <span>{label}</span>
</label>
