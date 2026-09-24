<!--
@component
The Tooltip component displays informative text on hover or focus, providing additional context.
-->

<script lang="ts" generics="T extends HTMLElement | string">
  import { onMount } from "svelte";
  import { on } from "svelte/events";
  import { type Attachment, createAttachmentKey } from "svelte/attachments";
  import { getOverlayPortalTarget, portal } from "$utils";
  import type { QTooltipProps } from "./props";

  // #region:    --- Props
  let {
    target,
    value = $bindable(false),
    position = "bottom",
    offset = { x: 0, y: 0 },
    delay = 250,
    hideDelay = 250,
    id: customId,
    role = "tooltip",
    children,
    trigger,
    ...props
  }: QTooltipProps<T> = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let triggerEl = $state<HTMLElement>();
  let isMounted = $state(false);
  let coordinates = $state({ top: 0, left: 0 });
  let tooltipEl = $state<HTMLDivElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Non-reactive variables
  const generatedId = $props.id();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isOpening = false;
  const triggerProps = { [createAttachmentKey()]: attachTarget };
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const id = $derived(customId ?? `q-tooltip-${generatedId}`);
  const realTarget = $derived.by(resolveTarget);
  // #endregion: --- Derived values

  // #region:    --- Lifecycle
  onMount(() => {
    isMounted = true;
  });
  // #endregion: --- Lifecycle

  // #region:    --- Effects
  $effect(() => {
    if (value) {
      clearTimeout(timer);
      isOpening = false;
    }

    return () => clearTimeout(timer);
  });

  $effect.pre(() => {
    if (!value && tooltipEl?.contains(document.activeElement)) {
      realTarget?.focus({ preventScroll: true });
      clearTimeout(timer);
      isOpening = false;
    }
  });

  $effect(() => {
    const element = realTarget;

    if (!element) {
      return;
    }

    const cleanup = [
      on(element, "mouseenter", show),
      on(element, "mouseleave", leave),
      on(element, "focusin", show),
      on(element, "focusout", leave),
    ];

    return () => {
      cleanup.forEach((remove) => remove());
      clearTimeout(timer);
      isOpening = false;
      value = false;
    };
  });

  $effect(() => {
    const element = realTarget;

    if (!value || !element || role !== "tooltip") {
      return;
    }

    const descriptionId = id;
    const descriptions = element.getAttribute("aria-describedby")?.split(/\s+/) ?? [];

    if (descriptions.includes(descriptionId)) {
      return;
    }

    element.setAttribute("aria-describedby", [...descriptions, descriptionId].join(" "));

    return () => removeTooltipDescription(element, descriptionId);
  });

  $effect(() => {
    if (!tooltipEl || !realTarget) {
      return;
    }

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(realTarget);
    observer.observe(tooltipEl);
    const cleanup = [
      on(window, "resize", updatePosition),
      on(window, "scroll", updatePosition, { capture: true }),
    ];

    return () => {
      observer.disconnect();
      cleanup.forEach((remove) => remove());
    };
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Shows the tooltip. */
  export function show() {
    clearTimeout(timer);
    isOpening = !value && !!realTarget;

    if (isOpening) {
      timer = setTimeout(() => {
        value = !!realTarget;
      }, delay);
    }
  }

  /** Hides the tooltip. */
  export function hide() {
    clearTimeout(timer);
    isOpening = false;
    timer = setTimeout(() => {
      value = false;
    }, hideDelay);
  }

  /** Toggles the tooltip visibility. */
  export function toggle() {
    value || isOpening ? hide() : show();
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function resolveTarget() {
    if (!isMounted) {
      return;
    }

    if (typeof target === "string") {
      return document.querySelector<HTMLElement>(target) ?? undefined;
    }

    if (target instanceof HTMLElement) {
      return target;
    }

    return triggerEl;
  }

  function attachTarget(element: HTMLElement) {
    triggerEl = element;
    return () => {
      triggerEl = undefined;
    };
  }

  function removeTooltipDescription(element: HTMLElement, descriptionId: string) {
    const remaining = element
      .getAttribute("aria-describedby")
      ?.split(/\s+/)
      .filter((description) => description !== descriptionId)
      .join(" ");

    if (remaining) {
      element.setAttribute("aria-describedby", remaining);
    } else {
      element.removeAttribute("aria-describedby");
    }
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    value = false;
  }

  function leave(event: MouseEvent | FocusEvent) {
    const next = event.relatedTarget;

    if (
      (next instanceof Node && (realTarget?.contains(next) || tooltipEl?.contains(next))) ||
      realTarget?.matches(":hover, :focus-within") ||
      tooltipEl?.matches(":hover, :focus-within")
    ) {
      return;
    }

    hide();
  }

  const attachPopup: Attachment<HTMLDivElement> = (element) => {
    const anchor = realTarget!;
    element.showPopover?.({ source: anchor });
    const cleanup = [
      on(element, "mouseenter", show),
      on(element, "mouseleave", leave),
      on(element, "focusin", show),
      on(element, "focusout", leave),
      on(window, "keydown", handleWindowKeydown, { capture: true }),
    ];

    return () => {
      cleanup.forEach((remove) => remove());

      clearTimeout(timer);
      isOpening = false;
    };
  };

  function updatePosition() {
    if (!realTarget || !tooltipEl) {
      return;
    }

    const rect = realTarget.getBoundingClientRect();
    const gap = position.includes("-") ? 0 : 8;

    for (const axis of ["x", "y"] as const) {
      const start = axis === "x" ? "left" : "top";
      const end = axis === "x" ? "right" : "bottom";
      const size = axis === "x" ? tooltipEl.offsetWidth : tooltipEl.offsetHeight;
      const limit = (axis === "x" ? window.innerWidth : window.innerHeight) - size - 8;
      const before = rect[start] - size - gap;
      const after = rect[end] + gap;
      let coordinate = (rect[start] + rect[end] - size) / 2;

      if (position.includes(start)) {
        coordinate = before < 8 && after <= limit ? after : before;
      } else if (position.includes(end)) {
        coordinate = after > limit && before >= 8 ? before : after;
      }

      coordinates[start] = Math.max(8, Math.min(coordinate + (offset[axis] ?? 0), limit));
    }
  }
  // #endregion: --- Functions

  Q.classes("q-tooltip", { classes: [props.class] });
</script>

{#if !target && trigger}
  {@render trigger(triggerProps)}
{/if}

{#if value && realTarget}
  <div
    bind:this={tooltipEl}
    {@attach portal(getOverlayPortalTarget(realTarget))}
    {...props}
    {id}
    {role}
    class="q-tooltip"
    style:top="{coordinates.top}px"
    style:left="{coordinates.left}px"
    popover="manual"
    data-quaff-overlay
    {@attach attachPopup}
  >
    {@render children?.()}
  </div>
{/if}
