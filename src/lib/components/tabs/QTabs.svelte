<script module lang="ts">
  import { QContext } from "$utils/context";
  import type { QTabsProps } from "./props";

  interface QTabsContext {
    readonly variant: QTabsProps["variant"];
    readonly inlineLabel: QTabsProps["inlineLabel"];
    readonly activeClass: QTabsProps["activeClass"];
    readonly activeStyle: QTabsProps["activeStyle"];
    value: QTabsProps["value"];
    focused: string | null;
    request: (name: string) => void;
  }

  export const tabsCtx = QContext<QTabsContext>("QTabs");
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { shouldReduceMotion } from "$utils";

  // #region:    --- Props
  let {
    value = $bindable(),
    variant = "primary",
    inlineLabel = false,
    noSeparator = false,
    activeClass,
    activeStyle,
    onfocusout,
    children,
    ...props
  }: QTabsProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  let qTabs: HTMLElement;
  let tabList: HTMLElement[] = [];
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let focused = $state<string | null>(null);
  // #endregion: --- Reactive variables

  // #region:    --- Context
  tabsCtx.set({
    value,
    activeClass,
    activeStyle,
    variant,
    inlineLabel,
    focused,
    request: updateValue,
  });
  // #endregion: --- Context

  // #region:    --- Effects
  $effect(() => {
    tabList = Array.from(qTabs.querySelectorAll(".q-tab"));
  });

  $effect.pre(() => {
    if (value === undefined) {
      return;
    }

    untrack(() => {
      const newTab = getRequestingTab(value!);
      animateIndicator(newTab);
    });
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  function updateValue(req: string) {
    const requester = getRequestingTab(req);
    if (!requester) {
      return;
    }

    const defaultPrevented = !qTabs.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );

    if (defaultPrevented) {
      return;
    }

    value = req;
  }

  function getRequestingTab(requestingTabName: string) {
    return tabList.find((tab) => tab.dataset.qTabName === requestingTabName) ?? null;
  }

  function getActiveTab() {
    return tabList.find((tab) => tab.getAttribute("aria-selected") === "true") ?? null;
  }

  function handleFocusout(e: FocusEvent & { currentTarget: HTMLElement }) {
    onfocusout?.(e);

    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      focused = null;
    }
  }

  function animateIndicator(newTab: HTMLElement | null) {
    if (!newTab) {
      return;
    }

    const qIndicator = newTab.querySelector(".q-tab__indicator");
    if (!qIndicator) {
      return;
    }
    const previousTab = getActiveTab();

    qIndicator.getAnimations().forEach((animation) => animation.cancel());
    const frames = getKeyframes(previousTab, newTab);
    if (frames) {
      qIndicator.animate(frames, {
        duration: 250,
        easing: "cubic-bezier(.3,0,0,1)",
      });
    }
  }

  function getKeyframes(oldTab: HTMLElement | null, newTab: HTMLElement) {
    if (!oldTab) {
      return null;
    }

    if (shouldReduceMotion()) {
      return [{ opacity: 0 }, { opacity: 1 }];
    }

    const previousEl = oldTab.querySelector<HTMLElement>(".q-tab__indicator");
    const activeEl = newTab.querySelector<HTMLElement>(".q-tab__indicator");

    if (!previousEl || !activeEl) {
      return null;
    }

    const pos = variant === "vertical" ? "top" : "left";
    const extent = variant === "vertical" ? "height" : "width";
    const axis = variant === "vertical" ? "Y" : "X";

    const fromRect = previousEl.getBoundingClientRect();
    const toRect = activeEl.getBoundingClientRect();
    const scale = fromRect[extent] / toRect[extent];

    if (!Number.isFinite(scale)) {
      return null;
    }

    // Including `transform: none` avoids quirky Safari behavior
    // that can hide the animation.
    return [
      {
        transform: `translate${axis}(${(fromRect[pos] - toRect[pos]).toFixed(4)}px) scale${axis}(${scale.toFixed(4)})`,
      },
      { transform: "none" },
    ];
  }
  // #endregion: --- Functions

  Q.classes("q-tabs", {
    bemClasses: {
      [variant]: true,
      "no-separator": noSeparator,
    },
    classes: [props.class],
  });
</script>

<nav
  {...props}
  bind:this={qTabs}
  class="q-tabs"
  role="tablist"
  aria-orientation={variant === "vertical" ? "vertical" : "horizontal"}
  onfocusout={handleFocusout}
  data-quaff
>
  {@render children?.()}
</nav>
