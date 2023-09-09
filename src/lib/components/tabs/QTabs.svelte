<script context="module" lang="ts">
  export type QTab = HTMLAnchorElement | HTMLButtonElement;

  export type QTabStore = {
    value?: string;
    variant: QTabsProps["variant"];
    previousEl: QTab | null;
    activeEl: QTab | null;
    utils: { position: number; size: number };
  };
</script>

<script lang="ts">
  import { createClasses, createStyles, movementDirection } from "$lib/utils";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import type { QTabsProps } from "./props";

  export let value: QTabsProps["value"] = undefined,
    variant: QTabsProps["variant"] = "primary",
    round: QTabsProps["round"] = false,
    userClasses: QTabsProps["userClasses"] = "";
  export { userClasses as class };

  let qTabs: HTMLElement;

  const qTabStore = writable<QTabStore>({
    value,
    variant,
    previousEl: null,
    activeEl: null,
    utils: { size: 0, position: 0 },
  });

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

    const child = variant === "primary" ? activeEl.firstElementChild as HTMLDivElement : { offsetLeft: 0, offsetWidth: 0 }
    const previousChild = variant === "primary" ? previousEl?.firstElementChild as HTMLDivElement : { offsetLeft: 0, offsetWidth: 0 }

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
            : (activeEl.offsetLeft + child.offsetLeft) + (child.offsetWidth || activeEl.offsetWidth) - (previousEl.offsetLeft + previousChild.offsetLeft);
      } else {
        // New tab is before the previous one
        transitionSize =
          storeVariant === "vertical"
            ? previousEl.offsetTop + previousEl.offsetHeight - activeEl.offsetTop
            : (previousEl.offsetLeft + previousChild.offsetLeft) + (previousChild.offsetWidth || previousEl.offsetWidth) - (activeEl.offsetLeft + child.offsetLeft);
        qTabs.style.setProperty("--indicator-position", `${position}px`);
      }

      qTabs.style.setProperty("--indicator-size", `${transitionSize / tabsSize}`);

      setTimeout(() => {
        qTabs.style.setProperty("--indicator-position", `${position}px`);
        qTabs.style.setProperty("--indicator-size", `${tabSize}`);
      }, 250);
    }
  }
</script>

<nav
  bind:this={qTabs}
  class="q-tabs q-tabs--{variant} {userClasses}"
  class:q-tabs--rounded={round}
  >
  <slot />
</nav>
