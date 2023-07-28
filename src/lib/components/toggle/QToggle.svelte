<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { onMount } from "svelte";
  import type { QToggleProps } from "./props";

  export let value: QToggleProps["value"],
    icon: QToggleProps["icon"] = undefined,
    label: QToggleProps["label"] = undefined,
    leftLabel: QToggleProps["leftLabel"] = undefined,
    disable: QToggleProps["disable"] = undefined,
    userClasses: QToggleProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([leftLabel && "reverse", disable && "disable", userClasses], {
    component: "q-toggle",
    userClasses,
  });

  $: classesInner = createClasses([icon && "icon"], {
    component: "q-toggle__inner",
  });

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
    <span class="q-toggle__label">
      {label}
    </span>
  {/if}
</div>
