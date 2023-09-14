<script lang="ts">
  import type { QToggleProps } from "./props";

  export let value: QToggleProps["value"],
    icon: QToggleProps["icon"] = undefined,
    label: QToggleProps["label"] = undefined,
    leftLabel: QToggleProps["leftLabel"] = undefined,
    disable: QToggleProps["disable"] = undefined,
    userClasses: QToggleProps["userClasses"] = "";
  export { userClasses as class };

  function toggle() {
    if (disable !== true) {
      value = !value;
    }
  }
</script>

<div
  on:click={toggle}
  class="q-toggle {userClasses}"
  class:q-toggle--reversed={leftLabel}
  class:q-toggle--disabled={disable}
  aria-disabled={disable || undefined}
  role="switch"
  aria-checked={value}
  tabindex="0"
  {...$$restProps}
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
