<script lang="ts">
  import type { QToggleProps } from "./props";

  let {
    value = $bindable(),
    icon = undefined,
    label = undefined,
    leftLabel = undefined,
    disable = undefined,
    ...props
  }: QToggleProps = $props();

  function toggle() {
    if (disable !== true) {
      value = !value;
    }
  }

  Q.classes("q-toggle", {
    bemClasses: {
      reversed: leftLabel,
      disabled: disable,
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-toggle"
  {...Q.classes}
  onclick={toggle}
  aria-disabled={disable || undefined}
  role="switch"
  aria-checked={value}
  tabindex="0"
>
  <label class="q-toggle__inner" class:q-toggle__inner--icon={icon}>
    <input bind:checked={value} type="checkbox" disabled={disable || undefined} />
    <span>
      {#if icon}
        <i>{icon}</i>
      {/if}
    </span>
  </label>
  {#if label}
    <span class="q-toggle__label">
      {label}
    </span>
  {/if}
</div>
