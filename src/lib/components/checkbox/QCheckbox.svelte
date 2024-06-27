<script lang="ts">
  import type { QCheckboxProps } from "./props";

  let { value = $bindable(), label = "", disable = false, ...props }: QCheckboxProps = $props();

  Q.classes("q-checkbox", {
    bemClasses: {
      disabled: disable,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-checkbox" {...Q.classes} aria-disabled={disable || undefined}>
  <input type="checkbox" bind:checked={value} disabled={disable} />
  <span>{label}</span>
</label>
