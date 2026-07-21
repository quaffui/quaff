<script lang="ts">
  import { ripple } from "$helpers";
  import type { QRadioProps } from "./props";

  // #region:    --- Props
  let {
    value = "",
    label = "",
    name,
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

<label
  {@attach ripple({ center: true, disabled })}
  {...props}
  class="q-radio"
  aria-disabled={disabled || undefined}
  data-quaff
>
  <input type="radio" bind:group={selected} {value} {name} {disabled} />
  <span class="q-radio__control" aria-hidden="true">
    <span class="q-radio__icon"></span>
  </span>
  {#if label}<span class="q-radio__label">{label}</span>{/if}
</label>
