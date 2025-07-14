<script lang="ts">
  import { setupTooltipContext } from "$utils";
  import type { QCheckboxProps } from "./props";

  let { value = $bindable(), label = "", disable = false, ...props }: QCheckboxProps = $props();

  const uid = $props.id();
  const componentId = `q-checkbox--${uid}`;

  setupTooltipContext(componentId);

  Q.classes("q-checkbox", {
    bemClasses: {
      disabled: disable,
      [componentId]: true,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-checkbox" aria-disabled={disable || undefined}>
  <input type="checkbox" bind:checked={value} disabled={disable} />
  <span>{label}</span>
</label>
