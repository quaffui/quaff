<script context="module" lang="ts">
  export type QTabEl = HTMLAnchorElement | HTMLButtonElement;
  export type QTabsElementsContext = {
    previous: QTabEl | null;
    active: QTabEl | null;
  };
</script>

<script lang="ts">
  import { setContext, untrack } from "svelte";
  import QContext from "$lib/classes/QContext.svelte";
  import { shouldReduceMotion } from "$lib/utils/dom";
  import type { QTabsProps } from "./props";

  let {
    value = $bindable(),
    variant = "primary",
    round = false,
    children,
    ...props
  }: QTabsProps = $props();

  let qTabs: HTMLElement;
  let tabList: HTMLElement[];

  const valueContext = new QContext<string | undefined | null>("QTabsValue", value);
  const requestContext = new QContext<string | null>("QTabsRequest", null);

  // Set the variant context
  setContext("QTabsVariant", variant);

  $effect(() => {
    tabList = Array.from(qTabs.querySelectorAll(".q-tab"));
  });

  // Update the context when "value" changes
  $effect(() => {
    if (!value) {
      return;
    }

    untrack(() => {
      const newTab = getResquetingTab(value!);
      animateIndicator(newTab);

      valueContext.update(value);
    });
  });

  // Try to update "value" when context changes from a QTab
  $effect(() => {
    const request = requestContext.value;

    if (!request) {
      return;
    }

    const defaultPrevented = !dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    const requester = getResquetingTab(request);
    if (defaultPrevented || !requester) {
      return;
    }

    untrack(() => {
      value = request;
    });
  });

  function getResquetingTab(requestingTabName: string) {
    return tabList.find((tab) => tab.getAttribute("aria-label") === requestingTabName) ?? null;
  }

  function getActiveTab() {
    return tabList.find((tab) => tab.getAttribute("aria-current") === "true") ?? null;
  }

  function animateIndicator(newTab: HTMLElement | null) {
    const qIndicator = newTab?.querySelector(".q-tab__indicator");

    if (!qIndicator) {
      return;
    }

    const previousTab = getActiveTab();

    qIndicator.getAnimations().forEach((animation) => animation.cancel());
    const frames = getKeyframes(previousTab, newTab!);
    if (frames !== null) {
      qIndicator.animate(frames, {
        duration: 600,
        easing: "cubic-bezier(.18,.77,0,1)",
      });
    }
  }

  function getKeyframes(oldTab: HTMLElement | null, newTab: HTMLElement) {
    const reduceMotion = shouldReduceMotion();
    if (!oldTab) {
      return reduceMotion ? [{ opacity: 1 }, { transform: "none" }] : null;
    }

    let previousEl = variant === "primary" ? oldTab?.querySelector(".q-tab__content") : oldTab;
    let activeEl = variant === "primary" ? newTab?.querySelector(".q-tab__content") : newTab;

    const pos = variant === "vertical" ? "top" : "left";
    const extent = variant === "vertical" ? "height" : "width";
    const axis = variant === "vertical" ? "Y" : "X";

    const fromRect = previousEl?.getBoundingClientRect() ?? ({} as DOMRect);
    const fromPos = fromRect[pos];
    const fromExtent = fromRect[extent];

    const toRect = activeEl?.getBoundingClientRect() ?? ({} as DOMRect);
    const toPos = toRect[pos];
    const toExtent = toRect[extent];

    const scale = fromExtent / toExtent;

    const keyframe: Keyframe = {};

    if (!reduceMotion && fromPos !== undefined && toPos !== undefined && !isNaN(scale)) {
      const translateAnimation = (fromPos - toPos).toFixed(4);
      const scaleAnimation = scale.toFixed(4);
      keyframe["transform"] =
        `translate${axis}(${translateAnimation}px) scale${axis}(${scaleAnimation})`;
    } else {
      keyframe["opacity"] = 0;
    }

    // Including `transform: none` avoids quirky Safari behavior
    // that can hide the animation.
    return [keyframe, { transform: "none" }];
  }

  Q.classes("q-tabs", {
    bemClasses: {
      rounded: round,
      [variant]: true,
    },
    classes: [props.class],
  });
</script>

<nav {...props} bind:this={qTabs} class="q-tabs" {...Q.classes}>
  {@render children?.()}
</nav>

<style lang="scss">
  @import "./QTabs.scss";
</style>
