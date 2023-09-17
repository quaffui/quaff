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
  import { movementDirection } from "$lib/utils";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import type { QTabsProps } from "./props";

  export let value: QTabsProps["value"] = undefined,
    variant: QTabsProps["variant"] = "primary",
    round: QTabsProps["round"] = false,
    userClasses: QTabsProps["userClasses"] = "";
  export { userClasses as class };

  const cssVars = {
    indicatorPosition: "--indicator-position",
    indicatorSize: "--indicator-size",
  };

  let qTabs: HTMLElement;

  const qTabStore = writable<QTabStore>({
    value,
    variant,
    previousEl: null,
    activeEl: null,
    utils: { size: 0, position: 0 },
  });

  // Update the store when "value" changes programmatically
  $: qTabStore.update(($store) => {
    $store.value = value;

    return $store;
  });
  // Update "value" when the store changes from QTab
  $: value = $qTabStore.value;

  setContext("qTabStore", qTabStore);

  $: if ($qTabStore.activeEl) {
    const {
      previousEl,
      activeEl,
      utils: { position, size },
      variant: storeVariant,
    } = $qTabStore;
    const tabsSize = storeVariant === "vertical" ? qTabs.offsetHeight : qTabs.offsetWidth;
    const tabSize = size / tabsSize;

    if (!previousEl) {
      // Position initial indicator
      qTabs.style.setProperty(cssVars.indicatorSize, `${tabSize}`);
      qTabs.style.setProperty(cssVars.indicatorPosition, `${position}px`);
    } else {
      // Position indicator on tab change
      const comparePositions = movementDirection(previousEl, activeEl);

      let transitionSize;
      if (comparePositions === "next") {
        // New tab is after the previous one
        transitionSize = prepareTransitionSize(storeVariant, previousEl, activeEl);
      } else {
        // New tab is before the previous one
        transitionSize = prepareTransitionSize(storeVariant, activeEl, previousEl);
        qTabs.style.setProperty(cssVars.indicatorPosition, `${position}px`);
      }

      qTabs.style.setProperty(cssVars.indicatorSize, `${transitionSize / tabsSize}`);

      setTimeout(() => {
        qTabs.style.setProperty(cssVars.indicatorPosition, `${position}px`);
        qTabs.style.setProperty(cssVars.indicatorSize, `${tabSize}`);
      }, 250);
    }
  }

  function prepareTransitionSize(storeVariant: typeof variant, fromEl: QTab, toEl: QTab) {
    const fromElChild =
      storeVariant === "primary"
        ? (fromEl.firstElementChild as HTMLDivElement)
        : { offsetLeft: 0, offsetWidth: 0 };
    const toElChild =
      storeVariant === "primary"
        ? (toEl.firstElementChild as HTMLDivElement)
        : { offsetLeft: 0, offsetWidth: 0 };

    return storeVariant === "vertical"
      ? toEl.offsetTop + toEl.offsetHeight - fromEl.offsetTop
      : toEl.offsetLeft +
          toElChild.offsetLeft +
          (toElChild.offsetWidth || toEl.offsetWidth) -
          (fromEl.offsetLeft + fromElChild.offsetLeft);
  }
</script>

<nav bind:this={qTabs} class="q-tabs q-tabs--{variant} {userClasses}" class:q-tabs--rounded={round}>
  <slot />
</nav>
