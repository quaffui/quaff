<script lang="ts">
  import type { QRadioProps } from "./props";

  let {
    value = "",
    label = "",
    selected = $bindable(),
    disable = false,
    ...props
  }: QRadioProps = $props();

  Q.classes("q-radio", {
    bemClasses: {
      disabled: disable,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-radio" {...Q.classes} aria-disabled={disable || undefined}>
  <input type="radio" bind:group={selected} {value} disabled={disable} />
  <span>{label}</span>
</label>
