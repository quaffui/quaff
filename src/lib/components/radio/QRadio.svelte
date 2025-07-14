<script lang="ts">
  import { setupTooltipContext } from "$utils";
  import type { QRadioProps } from "./props";

  let {
    value = "",
    label = "",
    selected = $bindable(),
    disable = false,
    ...props
  }: QRadioProps = $props();

  const uid = $props.id();
  const componentId = `q-radio--${uid}`;

  setupTooltipContext(componentId);

  Q.classes("q-radio", {
    bemClasses: {
      disabled: disable,
      [componentId]: true,
    },
    classes: [props.class],
  });
</script>

<label {...props} class="q-radio" aria-disabled={disable || undefined}>
  <input type="radio" bind:group={selected} {value} disabled={disable} />
  <span>{label}</span>
</label>
