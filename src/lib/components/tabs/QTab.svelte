<script lang="ts">
  import { getContext } from "svelte";
  import type { QTabProps } from "./props";
  import type { Writable } from "svelte/store";
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import QBtn from "../button/QBtn.svelte";

  export let name: QTabProps["name"],
    to: QTabProps["to"] = undefined,
    icon: QTabProps["icon"] = undefined,
    userClasses: QTabProps["userClasses"],
    userStyles: QTabProps["userStyles"];
  export { userClasses as class, userStyles as style };

  let index = 1;
  let indexContext = getContext<{
    index: () => number;
  }>("QTabCount");
  $: if (indexContext) {
    index = indexContext.index();
  }

  let activeStore = getContext<
    Writable<{
      name: string;
      index: number;
    }>
  >("activeTab");

  $: if (name === $activeStore.name) {
    setActive();
  }

  $: classes = createClasses([
    "q-tab q-pa-sm",
    name === $activeStore.name
      ? "active primary-text on-surface-text"
      : "surface on-surface-variant-text",
  ]);

  function setActive() {
    activeStore.set({
      name,
      index: index - 1,
    });
  }
</script>

<div class={classes} on:click={setActive} on:keyup on:keydown on:keypress>
  {#if icon}
    <QIcon name={icon} />
  {:else if $$slots.icon}
    <slot name="icon" />
  {/if}
  <slot />
</div>
