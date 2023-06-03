<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { onMount } from "svelte";
  import { type QToggleProps } from "./props";

  export let value: QToggleProps["value"],
    icon: QToggleProps["icon"] = undefined,
    label: QToggleProps["label"] = undefined,
    leftLabel: QToggleProps["leftLabel"] = undefined,
    disable: QToggleProps["disable"] = undefined,
    userClasses: QToggleProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([
    "q-toggle",
    leftLabel && "reverse",
    disable && "disable",
    userClasses,
  ]);

  $: classesInner = createClasses(["switch", icon && "icon"]);

  function toggle() {
    if (disable !== true) {
      value = !value;
    }
  }
</script>

<div on:click={toggle} class={classes} aria-disabled={disable} {...$$restProps}>
  <label class={classesInner}>
    <input bind:checked={value} type="checkbox" disabled={disable} />
    <span>
      {#if icon}
        <i>{icon}</i>
      {/if}
    </span>
  </label>
  {#if label}
    <span class="label">
      {label}
    </span>
  {/if}
</div>

<style lang="scss">
  .q-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.8em;
    cursor: pointer;

    .label {
      font-size: 1rem;
    }

    &.disable {
      cursor: not-allowed;

      .label {
        opacity: 0.5;
      }
    }

    & * {
      pointer-events: none;
    }
  }
</style>
