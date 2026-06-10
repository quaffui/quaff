<script lang="ts">
  import type { QRadioProps } from "./props";

  // #region:    --- Props
  let {
    value = "",
    label = "",
    selected = $bindable(),
    disabled = false,
    ...props
  }: QRadioProps = $props();
  // #endregion: --- Props

  Q.classes("q-radio", {
    bemClasses: {
      disabled,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-radio" aria-disabled={disabled || undefined} data-quaff>
  <input type="radio" bind:group={selected} {value} {disabled} />
  <span>{label}</span>
</label>
