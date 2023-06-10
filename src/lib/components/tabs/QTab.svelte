<script lang="ts">
  import { Quaff } from "$stores/Quaff";
  import { getContext } from "svelte";
  import type { QTabProps } from "./props";
  import type { Writable } from "svelte/store";
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import { isRouteActive } from "$lib/composables/use-router-link";

  export let name: QTabProps["name"] = undefined,
    to: QTabProps["to"] = undefined,
    icon: QTabProps["icon"] = undefined,
    userClasses: QTabProps["userClasses"];
  export { userClasses as class };

  let index = 1;
  let indexContext = getContext<{
    index: () => number;
  }>("QTabCount");
  $: if (indexContext) {
    index = indexContext.index();
  }

  let activeStore = getContext<
    Writable<{
      name?: string;
      index: number;
    }>
  >("activeTab");

  $: isActive = to !== undefined ? isRouteActive($Quaff.router, to) : name === $activeStore.name;

  $: if (isActive) {
    setActive();
  }

  $: classes = createClasses([
    "q-tab q-pa-sm",
    isActive ? "active primary-text on-surface-text" : "surface on-surface-variant-text",
    userClasses,
  ]);

  function setActive() {
    if (index !== $activeStore.index) {
      $activeStore = { name, index };
    }
  }
</script>

{#if to !== undefined}
  <a href={to} class={classes} on:click={setActive} on:keyup on:keydown on:keypress>
    {#if icon}
      <QIcon name={icon} />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}
    <slot />
  </a>
{:else}
  <div class={classes} on:click={setActive} on:keyup on:keydown on:keypress>
    {#if icon}
      <QIcon name={icon} />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}
    <slot />
  </div>
{/if}
