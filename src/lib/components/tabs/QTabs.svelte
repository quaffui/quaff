<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { QTabsProps } from "./props";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { writable } from "svelte/store";
  import { browser } from "$app/environment";

  export let value: QTabsProps["value"] = undefined,
    vertical: QTabsProps["vertical"] = false,
    round: QTabsProps["round"] = false,
    smallIndicator: QTabsProps["smallIndicator"] = false,
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

  let activeTabStore = writable({ name: value, index: 0 });
  $: activeTabStore.update(($active) => {
    $active.name = value;

    return $active;
  });
  setContext("activeTab", activeTabStore);

  $: value = $activeTabStore.name;

  $: classes = createClasses([
    "q-tabs",
    vertical && "vertical-tabs",
    round && "round",
    smallIndicator && "small-indicator",
    hidden && "hidden-indicator",
    userClasses,
  ]);

  $: style = createStyles(
    {
      "--tab-count": QTabCount || 1,
      "--indicator-width": smallIndicator ? "33%" : "100%",
      "--active-tab-index": $activeTabStore.index - 1,
    },
    userStyles
  );
</script>

<nav class={classes} {style}>
  <slot />
</nav>
