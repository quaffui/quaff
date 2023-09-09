<script context="module" lang="ts">
  export type QTab = HTMLAnchorElement | HTMLButtonElement;

  export type QTabStore = {
    value: string;
    variant: QTabsProps["variant"];
    previousEl: QTab | null;
    activeEl: QTab | null;
    utils: { position: number; size: number };
  };
</script>

<script lang="ts">
  import { createClasses, createStyles, movementDirection } from "$lib/utils";
  import { onMount, setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import type { Writable } from "svelte/store";
  import type { QTabsProps } from "./props";

  export let value: QTabsProps["value"],
    variant: QTabsProps["variant"] = "primary",
    round: QTabsProps["round"] = false,
    userClasses: QTabsProps["userClasses"] = undefined,
    userStyles: QTabsProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let qTabs: HTMLElement;

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

  const qTabStore = writable<QTabStore>({
    value,
    variant,
    previousEl: null,
    activeEl: null,
    utils: { size: 0, position: 0 },
  });

  $: console.log($qTabStore);

  /* const indicatorWidth = derived(qTabStore, ($store) => {
    return variant === "primary" ? `calc(${$store.size}px + 8px)` : `${$store.size}px`;
  }); */

  // Update the store when "value" changes programmatically
  $: qTabStore.update(($store) => {
    $store.value = value;

    return $store;
  });
  // Update "value" when the store changes from QTab
  $: value = $qTabStore.value;

  setContext("qTabStore", qTabStore);

  $: if ($qTabStore.activeEl !== null) {
    const {
      previousEl,
      activeEl,
      utils: { position, size },
      variant: storeVariant,
    } = $qTabStore;
    const tabsSize = storeVariant === "vertical" ? qTabs.offsetHeight : qTabs.offsetWidth;
    const tabSize = size / tabsSize;

    if (previousEl === null) {
      // Position initial indicator
      qTabs.style.setProperty("--indicator-size", `${tabSize}`);

      qTabs.style.setProperty("--indicator-position", `${position}px`);
    } else {
      // Position indicator on tab change
      const comparePositions = movementDirection(previousEl, activeEl);
      let transitionSize;
      if (comparePositions === "next") {
        // New tab is after the previous one
        transitionSize =
          storeVariant === "vertical"
            ? activeEl.offsetTop + activeEl.offsetHeight - previousEl.offsetTop
            : activeEl.offsetLeft + activeEl.offsetWidth - previousEl.offsetLeft;
      } else {
        // New tab is before the previous one
        transitionSize =
          storeVariant === "vertical"
            ? previousEl.offsetTop + previousEl.offsetHeight - activeEl.offsetTop
            : previousEl.offsetLeft + previousEl.offsetWidth - activeEl.offsetLeft;
        qTabs.style.setProperty("--indicator-position", `${position}px`);
      }

      qTabs.style.setProperty("--indicator-size", `${transitionSize / tabsSize}`);

      setTimeout(() => {
        qTabs.style.setProperty("--indicator-position", `${position}px`);
        qTabs.style.setProperty("--indicator-size", `${tabSize}`);
      }, 220);
    }
  }

  $: classes = createClasses([variant, round && "rounded", hidden && "hidden-indicator"], {
    component: "q-tabs",
    userClasses,
  });

  $: style = createStyles(
    {
      "--tab-count": QTabCount || 1,
      "--indicator-size": 0, // $indicatorWidth,
      //"--active-tab-index": $qTabStore.index - 1,
      //"--indicator-position": $qTabStore.position,
    },
    userStyles
  );
</script>

<nav class={classes} {style} bind:this={qTabs}>
  <slot />
</nav>
