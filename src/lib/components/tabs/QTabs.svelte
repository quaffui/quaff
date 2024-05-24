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
  import { untrack } from "svelte";
  import { movementDirection } from "$lib/utils";
  import QContext from "$lib/classes/QContext.svelte";
  import type { QTabsProps } from "./props";

  let {
    value = $bindable(),
    variant = "primary",
    round = false,
    children,
    ...props
  }: QTabsProps = $props();

  const cssVars = {
    indicatorPosition: "--indicator-position",
    indicatorSize: "--indicator-size",
  };

  let qTabs: HTMLElement;

  const ctx = new QContext<QTabStore>("q-tabs", {
    value,
    variant,
    previousEl: null,
    activeEl: null,
    utils: { size: 0, position: 0 },
  });

  const qTabStore = $derived(ctx.value);

  $effect(() => {
    value;

    untrack(() => {
      if (!ctx.value) {
        return;
      }

      ctx.updateEntry("value", value);
    });
  });

  // Update "value" when the store changes from QTab
  $effect(() => {
    ctx.value?.value;

    untrack(() => {
      value = ctx.value?.value;
    });
  });

  $effect(() => {
    if (!qTabStore?.activeEl) {
      return;
    }

    const {
      previousEl,
      activeEl,
      utils: { position, size },
      variant: storeVariant,
    } = qTabStore;
    const tabsSize = storeVariant === "vertical" ? qTabs.offsetHeight : qTabs.offsetWidth;
    const tabSize = size / tabsSize;

    if (!storeVariant) {
      throw new Error("q-tabs: expected storeVariant to be set");
    }

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
  });

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

  Q.classes("q-tabs", {
    bemClasses: {
      [variant]: !!variant,
      rounded: round,
    },
    classes: [props.class],
  });
</script>

<nav {...props} bind:this={qTabs} class="q-tabs" {...Q.classes}>
  {@render children?.()}
</nav>
