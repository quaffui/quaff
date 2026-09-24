<!--
@component
Browse visual collections with responsive Material 3 carousels, keyboard navigation, and accessible controls.
-->

<script lang="ts" generics="T">
  import { untrack } from "svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import { ripple } from "$helpers/ripple";
  import { getFocusableChildren, isFocusable, shouldReduceMotion } from "$utils/dom";
  import { createCarouselLayout } from "./carousel";
  import type { QCarouselProps } from "./props";

  let {
    items,
    children,
    variant = "multi-browse",
    alignment = "start",
    value = $bindable(0),
    itemWidth = 360,
    height,
    aspectRatio,
    itemLabel,
    onselect,
    snap,
    controls = true,
    showAll,
    labels,
    onkeydown,
    ...props
  }: QCarouselProps<T> = $props();

  const id = $props.id();
  const nativeControlSelector = "input, textarea, select, video, [contenteditable=true]";
  const keyboardControlSelector =
    "[role=slider], [role=combobox], [role=spinbutton], [role=listbox], [role=tablist]";
  let root: HTMLElement;
  let viewport: HTMLDivElement;
  let width = $state(0);
  let itemHeight = $state(0);
  let offset = $state(0);
  let reducedMotion = $state(false);
  let rtl = $state(false);
  let dragging = $state(false);
  let scrollTarget = $state<number>();
  let observedValue = 0;
  let previousRtl = false;
  let previousLayout: ReturnType<typeof createCarouselLayout>;
  let settleTimer: ReturnType<typeof setTimeout>;
  let pointer: { id: number; position: number; offset: number } | undefined;
  let suppressClick = false;

  const vertical = $derived(variant === "full-screen");
  const uncontained = $derived(variant.startsWith("uncontained") || reducedMotion);
  const leading = $derived(!vertical && uncontained ? 16 : 0);
  const snapping = $derived(vertical || (snap ?? !variant.startsWith("uncontained")));
  const defaultHeight = $derived(vertical ? "100svh" : "240px");
  const previousHorizontalIcon = $derived(rtl ? "arrow_forward" : "arrow_back");
  const nextHorizontalIcon = $derived(rtl ? "arrow_back" : "arrow_forward");
  const text = $derived({
    carousel: "carousel",
    slide: "slide",
    previous: "Previous item",
    next: "Next item",
    position: (index: number, count: number) => `${index + 1} of ${count}`,
    ...labels,
  });
  const layout = $derived(
    createCarouselLayout({
      variant,
      count: items.length,
      width: Math.max(0, width - leading),
      height: itemHeight,
      itemWidth,
      gap: vertical ? 16 : 8,
      alignment,
      reducedMotion,
      aspectRatios: aspectRatio ? items.map(aspectRatio) : undefined,
    })
  );
  const frames = $derived(layout.frames(offset));
  const current = $derived(normalizeIndex(value));
  const navigationOffset = $derived(scrollTarget ?? offset);
  const previousIndex = $derived(
    layout.offsets.findLastIndex((position) => position < navigationOffset - 1)
  );
  const nextIndex = $derived(
    layout.offsets.findIndex((position) => position > navigationOffset + 1)
  );

  $effect(() => {
    const nextLayout = layout;
    const requested = value;
    const index = normalizeIndex(requested);
    const direction = rtl;

    untrack(() => {
      if (!viewport) {
        return;
      }

      if (
        nextLayout !== previousLayout ||
        index !== observedValue ||
        direction !== previousRtl ||
        requested !== index
      ) {
        previousLayout = nextLayout;
        previousRtl = direction;
        observedValue = index;
        value = index;
        scrollTarget = undefined;
        scrollToIndex(index, "instant");
      }
    });
  });

  function observeViewport(element: HTMLDivElement) {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => (reducedMotion = shouldReduceMotion());
    const updateDirection = () => (rtl = getComputedStyle(element).direction === "rtl");
    const direction = new MutationObserver(updateDirection);
    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
      itemHeight = element.clientHeight;
      updateDirection();
    });

    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      direction.observe(ancestor, { attributes: true, attributeFilter: ["dir", "class", "style"] });
    }

    updateDirection();
    updateMotion();
    motion.addEventListener("change", updateMotion);
    resize.observe(element);

    return () => {
      resize.disconnect();
      direction.disconnect();
      motion.removeEventListener("change", updateMotion);
      clearTimeout(settleTimer);
    };
  }

  function normalizeIndex(index: number) {
    const roundedIndex = Number.isFinite(index) ? Math.round(index) : 0;
    return Math.max(0, Math.min(items.length - 1, roundedIndex));
  }

  function scrollToOffset(position: number, behavior: ScrollBehavior) {
    rtl = getComputedStyle(viewport).direction === "rtl";
    const direction = rtl ? -1 : 1;
    const scrollPosition = vertical
      ? { top: position, behavior }
      : { left: direction * position, behavior };
    viewport.scrollTo(scrollPosition);
    offset = vertical ? viewport.scrollTop : Math.abs(viewport.scrollLeft);
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior) {
    scrollToOffset(layout.offsets[index] ?? 0, behavior);
  }

  function setValue(index: number) {
    observedValue = normalizeIndex(index);

    if (value !== observedValue) {
      value = observedValue;
      root.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function navigateToIndex(index: number, focus = false) {
    index = normalizeIndex(index);
    scrollTarget = layout.offsets[index] ?? 0;
    setValue(index);
    scrollToIndex(index, focus || reducedMotion ? "instant" : "smooth");

    if (focus) {
      viewport
        .querySelector<HTMLElement>(`:scope > .q-carousel__rail > [data-carousel-index="${index}"]`)
        ?.focus({ preventScroll: true });
    }
  }

  function getNearestIndex() {
    return layout.offsets.reduce((nearest, position, index) => {
      const distance = Math.abs(position - offset);
      const nearestPosition = layout.offsets[nearest] ?? 0;
      const nearestDistance = Math.abs(nearestPosition - offset);
      return distance < nearestDistance ? index : nearest;
    }, current);
  }

  function settleScroll() {
    clearTimeout(settleTimer);

    if (!dragging) {
      scrollTarget = undefined;
      setValue(getNearestIndex());
    }
  }

  function handleScroll() {
    offset = vertical ? viewport.scrollTop : Math.abs(viewport.scrollLeft);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settleScroll, 150);
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
    onkeydown?.(event);

    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const target = event.target as HTMLElement;
    const item = getItem(target);

    if (!item || isKeyboardControlTarget(target)) {
      return;
    }

    const index = Number(item.dataset.carouselIndex);
    rtl = getComputedStyle(viewport).direction === "rtl";
    let previousKey = rtl ? "ArrowRight" : "ArrowLeft";
    let nextKey = rtl ? "ArrowLeft" : "ArrowRight";

    if (vertical) {
      previousKey = "ArrowUp";
      nextKey = "ArrowDown";
    }

    if ([previousKey, nextKey, "Home", "End"].includes(event.key)) {
      event.preventDefault();
      let targetIndex = index + (event.key === nextKey ? 1 : -1);

      if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = items.length - 1;
      }

      navigateToIndex(targetIndex, true);
    } else if (!vertical && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      const focusable = getFocusableChildren(document.body);
      const position = focusable.indexOf(document.activeElement as HTMLElement);
      const candidates =
        event.key === "ArrowDown"
          ? focusable.slice(position + 1)
          : focusable.slice(0, position).reverse();

      for (const element of candidates) {
        if (viewport.contains(element) || !isFocusable(element)) {
          continue;
        }

        element.focus();

        if (document.activeElement === element) {
          event.preventDefault();
          break;
        }
      }
    }
  }

  function handleFocusin(event: FocusEvent) {
    const item = getItem(event.target as HTMLElement);

    if (item && !pointer) {
      const index = Number(item.dataset.carouselIndex);
      scrollTarget = undefined;
      setValue(index);
      scrollToIndex(index, "instant");
    }
  }

  function getItem(target: HTMLElement) {
    const item = target.closest<HTMLElement>("[data-carousel-index]");
    return item?.closest(".q-carousel") === root ? item : null;
  }

  function getItemLabel(item: T, index: number) {
    if (itemLabel) {
      return `${itemLabel(item, index)}, ${text.position(index, items.length)}`;
    }

    if (onselect) {
      return undefined;
    }

    return text.position(index, items.length);
  }

  function isNativeControlTarget(target: HTMLElement) {
    return target.isContentEditable || target.closest(nativeControlSelector) !== null;
  }

  function isKeyboardControlTarget(target: HTMLElement) {
    return isNativeControlTarget(target) || target.closest(keyboardControlSelector) !== null;
  }

  function handlePointerdown(event: PointerEvent) {
    suppressClick = false;
    scrollTarget = undefined;

    if (event.defaultPrevented || event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    const isNestedCarousel = target.closest(".q-carousel") !== root;

    if (isNativeControlTarget(target) || isNestedCarousel) {
      return;
    }

    pointer = { id: event.pointerId, position: vertical ? event.clientY : event.clientX, offset };
  }

  function handlePointermove(event: PointerEvent) {
    if (event.defaultPrevented || !pointer || pointer.id !== event.pointerId) {
      return;
    }

    const pointerPosition = vertical ? event.clientY : event.clientX;
    const direction = !vertical && rtl ? -1 : 1;
    const delta = (pointer.position - pointerPosition) * direction;

    if (Math.abs(delta) > 5 && !dragging) {
      dragging = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.style.scrollSnapType = "none";
      suppressClick = true;
    }

    if (dragging) {
      event.preventDefault();
      scrollToOffset(pointer.offset + delta, "instant");
    }
  }

  function handlePointerEnd() {
    if (!pointer) {
      return;
    }

    const wasDragging = dragging;
    pointer = undefined;
    dragging = false;
    viewport.style.removeProperty("scroll-snap-type");

    if (wasDragging) {
      if (snapping) {
        navigateToIndex(getNearestIndex());
      } else {
        settleScroll();
      }
    }
  }

  function handleClickCapture(event: MouseEvent) {
    if (suppressClick && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  }

  Q.classes("q-carousel", {
    bemClasses: {
      [variant]: true,
      uncontained: uncontained && !vertical,
      snap: snapping,
      dragging,
    },
    classes: [props.class],
  });
</script>

<section
  {...props}
  bind:this={root}
  class="q-carousel"
  role={props.role ?? (props["aria-label"] || props["aria-labelledby"] ? "region" : "group")}
  aria-roledescription={text.carousel}
  onkeydown={handleKeydown}
  data-quaff
>
  <div
    bind:this={viewport}
    class="q-carousel__viewport"
    role="presentation"
    tabindex="-1"
    style:height={height ?? defaultHeight}
    onscroll={handleScroll}
    onscrollend={settleScroll}
    onwheel={() => (scrollTarget = undefined)}
    onfocusin={handleFocusin}
    onpointerdown={handlePointerdown}
    onpointermove={handlePointermove}
    onpointerup={handlePointerEnd}
    onpointercancel={handlePointerEnd}
    onlostpointercapture={handlePointerEnd}
    onpointerleave={() => !dragging && handlePointerEnd()}
    ondragstart={(event) => event.preventDefault()}
    onclickcapture={handleClickCapture}
    {@attach observeViewport}
  >
    <div
      class="q-carousel__rail"
      style:width={vertical ? "100%" : `${layout.length + leading}px`}
      style:height={vertical ? `${layout.length}px` : "100%"}
    >
      {#each items as item, index (index)}
        {@const frame = frames[index]}
        <span
          class="q-carousel__snap"
          aria-hidden="true"
          style:inset-inline-start={vertical ? "0" : `${layout.offsets[index]}px`}
          style:top={vertical ? `${layout.offsets[index]}px` : "0"}
        ></span>
        <svelte:element
          this={onselect ? "button" : "div"}
          class="q-carousel__item"
          type={onselect ? "button" : undefined}
          role={onselect ? undefined : "group"}
          aria-roledescription={onselect ? undefined : text.slide}
          aria-label={getItemLabel(item, index)}
          aria-describedby={onselect && !itemLabel ? `${id}-${index}` : undefined}
          tabindex="0"
          data-carousel-index={index}
          style:inset-inline-start={vertical ? "0" : `${leading + offset + frame.position}px`}
          style:top={vertical ? `${offset + frame.position}px` : "0"}
          style:width={vertical ? "100%" : `${frame.size}px`}
          style:height={vertical ? `${frame.size}px` : "100%"}
          style:--q-carousel-content-size={`${frame.contentSize}px`}
          onclick={onselect ? () => onselect?.(item, index) : undefined}
          {@attach ripple({ disabled: !onselect })}
        >
          <div class="q-carousel__content">{@render children({ item, index })}</div>
          {#if onselect && !itemLabel}
            <span id={`${id}-${index}`} hidden>{text.position(index, items.length)}</span>
          {/if}
        </svelte:element>
      {/each}
    </div>
  </div>
  {#if controls || showAll}
    <div class="q-carousel__controls">
      {#if controls}
        <QIconBtn
          type="button"
          icon={vertical ? "arrow_upward" : previousHorizontalIcon}
          aria-label={text.previous}
          disabled={previousIndex < 0}
          onclick={() => navigateToIndex(previousIndex)}
        />
        <QIconBtn
          type="button"
          icon={vertical ? "arrow_downward" : nextHorizontalIcon}
          aria-label={text.next}
          disabled={nextIndex < 0}
          onclick={() => navigateToIndex(nextIndex)}
        />
      {/if}
      {@render showAll?.()}
    </div>
  {/if}
  <span class="q-carousel__status" aria-live="polite" aria-atomic="true"
    >{items.length ? text.position(current, items.length) : ""}</span
  >
</section>
