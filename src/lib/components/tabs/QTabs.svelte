<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { QTabsProps } from "./props";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { derived, writable } from "svelte/store";

  export let value: QTabsProps["value"] = undefined,
    variant: QTabsProps["variant"] = "primary",
    round: QTabsProps["round"] = false,
    userClasses: QTabsProps["userClasses"] = undefined,
    userStyles: QTabsProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  // Hide indicator until it's mounted
  let hidden = true;

  onMount(() => {
    setTimeout(() => {
      hidden = false;
    }, 200);
  });

  /** Counting QTab children number */
  let QTabCount = 0;
  setContext("QTabCount", {
    index: () => {
      QTabCount += 1;
      return QTabCount;
    },
  });

  let activeTabStore = writable({ name: value, index: 0, size: 0, position: 0 });
  $: activeTabStore.update(($active) => {
    $active.name = value;

    return $active;
  });
  setContext("activeTab", activeTabStore);
  setContext("variant", variant);

  $: value = $activeTabStore.name;

  $: classes = createClasses([variant, round && "rounded", hidden && "hidden-indicator"], {
    component: "q-tabs",
    userClasses,
  });

  let indicatorWidth = derived(activeTabStore, ($activeTabStore) => {
    return variant === "primary"
      ? `calc(${$activeTabStore.size}px + 8px)`
      : `${$activeTabStore.size}px`;
  });

  $: style = createStyles(
    {
      "--tab-count": QTabCount || 1,
      "--indicator-size": $indicatorWidth,
      "--active-tab-index": $activeTabStore.index - 1,
      "--indicator-position": $activeTabStore.position,
    },
    userStyles
  );
</script>

<nav class={classes} {style}>
  <slot />
</nav>
