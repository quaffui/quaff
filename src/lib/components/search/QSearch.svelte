<!--
@component
Search bars expand into a focused space for suggestions, filters, and results.
-->

<script lang="ts">
  import { onDestroy, tick, untrack } from "svelte";
  import { on } from "svelte/events";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";
  import QDialog from "$components/dialog/QDialog.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QLinearProgress from "$components/progress/QLinearProgress.svelte";
  import { ripple } from "$helpers";
  import { useI18n } from "$internal/i18n.svelte";
  import { quaffConfig } from "$internal/quaffConfig";
  import { getClosestFocusableChild, shouldReduceMotion, type QEvent } from "$utils";
  import { prepareSearchMotion, type SearchMotion } from "./searchMotion";
  import type { QSearchProps } from "./props";

  const i18n = useI18n("search");

  let {
    value = $bindable(""),
    open = $bindable(false),
    layout = "auto",
    expressive,
    placeholder: providedPlaceholder,
    disabled = false,
    readonly = false,
    loading = false,
    status,
    labels,
    leading,
    trailing,
    children,
    onsearch,
    oninput,
    onkeydown,
    oninvalid,
    class: className,
    style,
    ...props
  }: QSearchProps = $props();

  const id = $props.id();
  const viewId = `${id}-view`;
  const placeholder = $derived(providedPlaceholder ?? i18n.labels.placeholder);
  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const isFullscreen = $derived(
    layout === "fullscreen" || (layout === "auto" && (innerWidth.current ?? 600) < 600)
  );
  const accessibleLabel = $derived(props["aria-label"] ?? placeholder);
  const resolvedLabels = $derived({
    ...i18n.labels,
    ...labels,
  });

  let barEl = $state<HTMLDivElement>();
  let inputEl = $state<HTMLInputElement>();
  let contentEl = $state<HTMLDivElement>();
  let resultsEl = $state<HTMLDivElement>();
  let resultsContentEl = $state<HTMLDivElement>();
  let position = $state({ top: 0, left: 0, width: 360, height: 240 });
  let isDialogOpen = $state(false);
  let activeMotion: SearchMotion | undefined;

  $effect(() => {
    const shouldOpen = open && !disabled;
    let isCurrent = true;

    if (disabled) {
      open = false;
    }

    untrack(() => animateView(shouldOpen, () => isCurrent));

    return () => {
      isCurrent = false;
    };
  });

  $effect(() => {
    // Finish spatial motion if the viewport changes while the dialog is opening.
    if (innerWidth.current === undefined || innerHeight.current === undefined) {
      return;
    }

    untrack(cancelAnimations);

    if (!isDialogOpen || isFullscreen || !barEl || !contentEl) {
      return;
    }

    updatePosition();

    const observer = new ResizeObserver(updatePosition);
    observer.observe(barEl);
    const removeScrollListener = on(window, "scroll", updatePosition, { capture: true });

    return () => {
      observer.disconnect();
      removeScrollListener();
    };
  });

  onDestroy(cancelAnimations);

  /** Opens the search view and focuses the input. */
  export function show() {
    if (!disabled) {
      open = true;
    }
  }

  /** Closes the search view, preserving the query. */
  export function hide() {
    open = false;
  }

  function cancelAnimations() {
    activeMotion?.cancel();
    activeMotion = undefined;
  }

  async function animateView(shouldOpen: boolean, isCurrent: () => boolean) {
    const dialog = contentEl?.closest("dialog");
    const header = contentEl?.querySelector<HTMLElement>(".q-search__header");
    const panel = contentEl?.querySelector<HTMLElement>(".q-search__panel");
    const divider = contentEl?.querySelector<HTMLElement>(".q-search__divider");

    if (!dialog || !barEl || !header || !panel || !divider) {
      return;
    }

    const alreadyClosed = !shouldOpen && !dialog.open;
    // Capture interrupted motion before canceling its fill effects.
    const prepared = prepareSearchMotion(
      { bar: barEl, dialog, header, panel, divider },
      { opening: shouldOpen, expressive: isExpressive, fullscreen: isFullscreen }
    );
    cancelAnimations();

    if (alreadyClosed || disabled || shouldReduceMotion()) {
      isDialogOpen = shouldOpen;
      await tick();

      if (isCurrent() && shouldOpen) {
        inputEl?.focus({ preventScroll: true });
      }

      return;
    }

    // Keep the native dialog open through both directions of the animation.
    isDialogOpen = true;
    await tick();

    if (!isCurrent()) {
      return;
    }

    const motion = prepared.start({
      expressive: isExpressive,
      fullscreen: isFullscreen,
      resultsContent: resultsContentEl,
      isCurrent,
    });
    activeMotion = motion;

    if (shouldOpen) {
      inputEl?.focus({ preventScroll: true });
    }

    await motion.wait();
    motion.stopObserving();

    if (!isCurrent()) {
      return;
    }

    if (!shouldOpen) {
      isDialogOpen = false;
      await tick();
    }

    motion.cancel();
  }

  function handleDialogChange(next: boolean) {
    if (!next) {
      hide();
    }
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    hide();
  }

  async function search(query = value) {
    if (disabled) {
      return;
    }

    value = query;
    onsearch?.(query);
    await tick();

    if (open) {
      resultsEl?.focus({ preventScroll: true });
    }
  }

  function updatePosition() {
    if (!barEl || !contentEl) {
      return;
    }

    const anchor = barEl.getBoundingClientRect();
    const viewportWidth = innerWidth.current ?? 0;
    const viewportHeight = innerHeight.current ?? 0;
    const margin = 12;
    const expansion = isExpressive ? 24 : 0;
    const width = Math.min(
      Math.max(360, anchor.width + expansion),
      720,
      viewportWidth - margin * 2
    );
    const outset = Math.min(expansion / 2, Math.max(0, (width - anchor.width) / 2));
    const start =
      getComputedStyle(barEl).direction === "rtl"
        ? anchor.right - width + outset
        : anchor.left - outset;
    const left = Math.max(margin, Math.min(start, viewportWidth - width - margin));
    const minHeight = Math.min(240, (viewportHeight * 2) / 3, viewportHeight - margin * 2);
    const top = Math.max(margin, Math.min(anchor.top, viewportHeight - minHeight - margin));
    const height = Math.min((viewportHeight * 2) / 3, viewportHeight - top - margin);

    if (
      top !== position.top ||
      left !== position.left ||
      width !== position.width ||
      height !== position.height
    ) {
      cancelAnimations();
      position = { top, left, width, height };
    }
  }

  function handleKeydown(event: QEvent<KeyboardEvent, HTMLInputElement>) {
    onkeydown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.isComposing || event.keyCode === 229) {
      if (event.key === "Escape") {
        event.preventDefault();
      }

      return;
    }

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        search();
        break;
      case "Escape": {
        const hasOpenMenu = contentEl?.closest("dialog")?.querySelector("[data-quaff-menu]");

        if (hasOpenMenu) {
          return;
        }

        event.preventDefault();
        hide();
        break;
      }
      case "ArrowDown": {
        if (!resultsEl) {
          return;
        }

        event.preventDefault();
        const list = resultsEl.querySelector<HTMLElement>("ul, ol, [role=list], [role=listbox]");
        (getClosestFocusableChild(list ?? resultsEl) ?? resultsEl).focus();
        break;
      }
    }
  }

  async function handleInvalid(event: QEvent<Event, HTMLInputElement>) {
    oninvalid?.(event);

    if (event.defaultPrevented || open) {
      return;
    }

    // Reveal a closed field before the browser tries to focus its validation message.
    event.preventDefault();
    show();
    await tick();

    if (open) {
      inputEl?.reportValidity();
    }
  }

  function handleClear() {
    if (inputEl && !readonly) {
      inputEl.value = "";
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.focus();
    }
  }

  function handleClose(event: QEvent<Event, HTMLDialogElement>) {
    if (!event.currentTarget.open) {
      open = false;
      isDialogOpen = false;
    }
  }
</script>

<div
  class={[
    "q-search",
    "q-field",
    isExpressive && "q-search--expressive",
    disabled && "q-field--disabled",
    className,
  ]}
  {style}
  dir={props.dir}
  data-quaff
>
  <div bind:this={barEl} class="q-search__bar q-field__wrapper" inert={disabled}>
    {#if leading}
      <div class="q-search__accessory">{@render leading()}</div>
    {/if}

    <button
      type="button"
      class="q-search__trigger"
      {disabled}
      aria-label={value ? `${accessibleLabel}: ${value}` : accessibleLabel}
      aria-labelledby={props["aria-labelledby"]
        ? `${props["aria-labelledby"]} ${id}-query`
        : undefined}
      aria-describedby={props["aria-describedby"]}
      aria-haspopup="dialog"
      aria-controls={viewId}
      aria-expanded={open}
      onclick={show}
      {@attach ripple({
        disabled: !!disabled,
        color: "on-surface",
        effectTarget: ".q-search__state",
      })}
    >
      <span class="q-search__state" aria-hidden="true"></span>
      {#if !leading}
        <span class="q-search__icon"><QIcon name="search" size="24px" /></span>
      {/if}
      <span id={`${id}-query`} class="q-search__text" class:q-search__text--placeholder={!value}
        >{value || placeholder}</span
      >
    </button>

    {#if trailing}
      <div class="q-search__accessory">{@render trailing()}</div>
    {/if}
  </div>

  <QDialog
    bind:value={() => isDialogOpen, handleDialogChange}
    modal
    position="top"
    fullscreen={isFullscreen}
    class={`q-search__view${isExpressive ? " q-search__view--expressive" : ""}${open ? " q-search__view--expanded" : ""}`}
    style={`--q-search-top: ${position.top}px; --q-search-left: ${position.left}px; --q-search-width: ${position.width}px; --q-search-height: ${position.height}px;`}
    id={viewId}
    aria-label={accessibleLabel}
    aria-labelledby={props["aria-labelledby"]}
    onclose={handleClose}
    oncancel={handleCancel}
  >
    <div bind:this={contentEl} class="q-search__content">
      <div class="q-search__header q-field__wrapper">
        <span class="q-search__divider" aria-hidden="true"></span>
        <QIconBtn
          type="button"
          class="q-search__back"
          expressive={false}
          size="md"
          aria-label={resolvedLabels.back}
          onclick={hide}
        >
          {#snippet icon()}
            <QIcon name="arrow_back" class="q-search__back-glyph" aria-hidden="true" />
            {#if !leading}
              <QIcon name="search" class="q-search__search-glyph" aria-hidden="true" />
            {/if}
          {/snippet}
        </QIconBtn>
        <input
          {...props}
          bind:this={inputEl}
          class="q-field__input"
          type="search"
          bind:value
          {placeholder}
          {disabled}
          {readonly}
          autocomplete={props.autocomplete ?? "off"}
          enterkeyhint={props.enterkeyhint ?? "search"}
          aria-label={accessibleLabel}
          {oninput}
          onkeydown={handleKeydown}
          oninvalid={handleInvalid}
        />
        {#if value && !readonly}
          <QIconBtn
            type="button"
            icon="close"
            class="q-search__clear"
            expressive={false}
            size="md"
            aria-label={resolvedLabels.clear}
            onclick={handleClear}
          />
        {/if}
      </div>

      <div class="q-search__panel">
        {#if loading}
          <QLinearProgress
            indeterminate
            size="2px"
            expressive={false}
            aria-hidden="true"
            class="q-search__progress"
          />
        {/if}
        <div
          bind:this={resultsEl}
          class="q-search__results"
          role="region"
          tabindex="-1"
          aria-label={resolvedLabels.results}
          aria-busy={loading}
        >
          <div bind:this={resultsContentEl} class="q-search__results-content">
            {@render children?.({ value, close: hide, search })}
          </div>
        </div>
      </div>
      <span class="q-search__status" role="status" aria-live="polite" aria-atomic="true">
        {#if open}
          {loading ? resolvedLabels.searching : (status ?? resolvedLabels.results)}
        {/if}
      </span>
    </div>
  </QDialog>
</div>
