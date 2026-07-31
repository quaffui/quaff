<script lang="ts">
  import { untrack } from "svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QItem from "$components/list/QItem.svelte";
  import QItemSection from "$components/list/QItemSection.svelte";
  import { listCtx } from "$components/list/QList.svelte";
  import QSeparator from "$components/separator/QSeparator.svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import type { QExpansionItemProps } from "./props";

  // #region:    --- Props
  let {
    defaultOpened = false,
    value = $bindable(defaultOpened),
    label,
    icon,
    caption,
    expandIcon = "keyboard_arrow_down",
    expandedIcon,
    dense = false,
    duration,
    hideExpandIcon = false,
    toggleAriaLabel,
    expandIconToggle = false,
    to,
    href,
    replace,
    target,
    name,
    noRotateExpandIcon = false,
    disabled = false,
    noRipple = false,
    summary,
    children,
    onclick: onClick,
    onkeydown: onKeydown,
    ontransitionrun: onTransitionRun,
    ontransitionend: onTransitionEnd,
    ontransitioncancel: onTransitionCancel,
    onExpandIconClick,
    ...props
  }: QExpansionItemProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  const contentId = `q-expansion-item__content-${id}`;
  const panelSizeProperty = "--q-expansion-panel-size";
  const ctx = listCtx.assertGet("QExpansionItem should be used inside QList");
  const initialName = untrack(() => name);

  if (initialName && value && !ctx.claimInitialExpansion(initialName)) {
    value = false;
  }

  let previousValue = value;
  let expansionEl: HTMLDivElement;
  let contentEl: HTMLDivElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let hasOpened = $state(value);
  let contentHeight = $state(0);
  let panelOpen = $state(value);
  let panelMeasured = $state(false);
  let panelMotionReady = $state(false);
  let panelRaised = $state(false);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const hasLink = $derived((to || href) !== undefined);
  const hasSeparateToggle = $derived(expandIconToggle || hasLink);
  const isDense = $derived(dense || ctx.dense);
  const toggleIcon = $derived(expandedIcon && value ? expandedIcon : expandIcon);
  const resolvedDuration = $derived(duration ?? (ctx.expressive ? 350 : 300));
  const resolvedToggleAriaLabel = $derived(
    toggleAriaLabel ??
      (label
        ? `${value ? "Collapse" : "Expand"} ${label}`
        : value
          ? "Collapse details"
          : "Expand details")
  );
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    if (name && value) {
      return ctx.openExpansion(name, hide);
    }
  });

  $effect(() => {
    if (value) {
      if (ctx.expressive && !hasOpened) {
        contentHeight = contentEl.scrollHeight;
      }
      hasOpened = true;
      panelOpen = true;
    } else {
      panelOpen = false;
    }
  });

  $effect(() => {
    if (
      !ctx.expressive ||
      typeof ResizeObserver === "undefined" ||
      typeof CSS === "undefined" ||
      typeof CSS.registerProperty !== "function"
    ) {
      panelMeasured = false;
      panelMotionReady = false;
      panelRaised = false;
      return;
    }

    let active = true;
    const measureContent = (entry?: ResizeObserverEntry) => {
      if (active) {
        contentHeight = entry?.borderBoxSize[0]?.blockSize ?? contentEl.scrollHeight;
      }
    };

    measureContent();
    panelMeasured = true;

    const observer = new ResizeObserver(([entry]) => measureContent(entry));
    observer.observe(contentEl);

    const frameId = requestAnimationFrame(() => {
      if (active) {
        panelMotionReady = true;
      }
    });

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  });

  $effect(() => {
    const currentValue = value;

    if (currentValue === previousValue) {
      return;
    }

    const oldState = previousValue ? "open" : "closed";
    const newState = currentValue ? "open" : "closed";
    previousValue = currentValue;

    const event =
      typeof ToggleEvent === "undefined"
        ? (Object.assign(new Event("toggle"), {
            oldState,
            newState,
            source: null,
          }) as ToggleEvent)
        : new ToggleEvent("toggle", { oldState, newState });
    expansionEl.dispatchEvent(event);
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  export function toggle() {
    value = !value;
  }

  export function show() {
    value = true;
  }

  export function hide() {
    value = false;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function handleHeaderClick(e: QEvent<MouseEvent, HTMLElement>) {
    onClick?.(e);

    if (!e.defaultPrevented && !hasSeparateToggle) {
      toggle();
    }
  }

  function handleToggleClick(e: QEvent<MouseEvent, HTMLElement>) {
    e.preventDefault();
    toggle();
    onExpandIconClick?.(e);
  }

  function isRepeatedActivation(e: KeyboardEvent) {
    return e.repeat && (isActivationKey(e) || e.key === "Enter" || e.key === " ");
  }

  function handleHeaderKeydown(e: QEvent<KeyboardEvent, HTMLElement>) {
    onKeydown?.(e);

    if (!e.defaultPrevented && isRepeatedActivation(e)) {
      e.preventDefault();
    }
  }

  function handleToggleKeydown(e: QEvent<KeyboardEvent, HTMLElement>) {
    if (isRepeatedActivation(e)) {
      e.preventDefault();
    }
  }

  function isPanelSizeTransition(e: QEvent<TransitionEvent, HTMLDivElement>) {
    return e.target === expansionEl && e.propertyName === panelSizeProperty;
  }

  function handlePanelTransitionRun(e: QEvent<TransitionEvent, HTMLDivElement>) {
    if (isPanelSizeTransition(e) && !panelOpen) {
      // The spring's negative lobe briefly pulls following items beneath this surface.
      panelRaised = true;
    }

    onTransitionRun?.(e);
  }

  function handlePanelTransitionEnd(e: QEvent<TransitionEvent, HTMLDivElement>) {
    if (isPanelSizeTransition(e)) {
      panelRaised = false;
    }

    onTransitionEnd?.(e);
  }

  function handlePanelTransitionCancel(e: QEvent<TransitionEvent, HTMLDivElement>) {
    if (isPanelSizeTransition(e)) {
      const panelSize = Number.parseFloat(
        getComputedStyle(expansionEl).getPropertyValue(panelSizeProperty)
      );

      if (!panelOpen || !Number.isFinite(panelSize) || panelSize >= 0) {
        panelRaised = false;
      }
    }

    onTransitionCancel?.(e);
  }
  // #endregion: --- Functions

  Q.classes("q-expansion-item", {
    bemClasses: {
      expanded: value,
      disabled,
      dense: isDense,
      expressive: ctx.expressive,
      measured: panelMeasured,
      "motion-ready": panelMotionReady,
      "panel-open": ctx.expressive && panelOpen,
      "panel-raised": ctx.expressive && panelRaised,
      "no-round": ctx.noRound,
    },
    classes: [props.class],
  });

  Q.classes("q-expansion-item__toggle-icon", {
    bemClasses: {
      disabled,
      expanded: value,
      rotate: value && !expandedIcon && !noRotateExpandIcon,
    },
  });
</script>

{#snippet labelSnippet()}
  {label}
{/snippet}

{#snippet captionSnippet()}
  {caption}
{/snippet}

{#snippet separateToggleIcon()}
  <QIcon
    class="q-expansion-item__toggle-icon-glyph"
    name={toggleIcon}
    size={ctx.expressive ? "sm" : "md"}
    aria-hidden="true"
  />
{/snippet}

{#snippet itemContent()}
  {#if summary}
    {@render summary({ expanded: value, show, hide, toggle })}
  {:else}
    {#if icon}
      <QItemSection type="icon">
        <QIcon name={icon} aria-hidden="true" />
      </QItemSection>
    {/if}

    {#if label || caption}
      <QItemSection
        headline={label ? labelSnippet : undefined}
        line1={caption ? captionSnippet : undefined}
      />
    {/if}
  {/if}
{/snippet}

{#if ctx.separatorOptions}
  <QSeparator {...ctx.separatorOptions} />
{/if}

<div
  bind:this={expansionEl}
  {...props}
  class="q-expansion-item"
  style:--q-expansion-duration="{resolvedDuration}ms"
  style:--q-expansion-panel-height="{contentHeight}px"
  ontransitionrun={handlePanelTransitionRun}
  ontransitionend={handlePanelTransitionEnd}
  ontransitioncancel={handlePanelTransitionCancel}
>
  {#if hasSeparateToggle}
    <div class="q-expansion-item__header">
      <QItem
        class={["q-expansion-item__item", ctx.noRound && "q-expansion-item__item--square"]}
        {dense}
        {to}
        {href}
        {replace}
        {target}
        {disabled}
        {noRipple}
        noSeparator
        role={hasLink ? "link" : "presentation"}
        onclick={handleHeaderClick}
        onkeydown={handleHeaderKeydown}
      >
        {@render itemContent()}
      </QItem>

      <QIconBtn
        class="q-expansion-item__toggle-icon"
        icon={separateToggleIcon}
        expressive={ctx.expressive}
        width={ctx.expressive ? "narrow" : "default"}
        {disabled}
        {noRipple}
        flat
        color="on-surface"
        aria-label={resolvedToggleAriaLabel}
        aria-expanded={value}
        aria-controls={contentId}
        onclick={handleToggleClick}
        onkeydown={handleToggleKeydown}
      />
    </div>
  {:else}
    <QItem
      class={[
        "q-expansion-item__item",
        "q-expansion-item__item--whole",
        ctx.noRound && "q-expansion-item__item--square",
      ]}
      {dense}
      {disabled}
      {noRipple}
      noSeparator
      clickable
      role="button"
      aria-label={!label && !caption && !summary ? resolvedToggleAriaLabel : undefined}
      aria-expanded={value}
      aria-controls={contentId}
      onclick={handleHeaderClick}
      onkeydown={handleHeaderKeydown}
    >
      {@render itemContent()}

      {#if !hideExpandIcon}
        <QItemSection class="q-expansion-item__toggle-section" type="trailingIcon">
          <span class="q-expansion-item__toggle-icon" aria-hidden="true">
            <QIcon class="q-expansion-item__toggle-icon-glyph" name={toggleIcon} />
          </span>
        </QItemSection>
      {/if}
    </QItem>
  {/if}

  <div id={contentId} class="q-expansion-item__panel" aria-hidden={!value} inert={!value}>
    <div class="q-expansion-item__panel-clip">
      <div
        bind:this={contentEl}
        class="q-expansion-item__content"
        class:q-expansion-item__content--regular={!isDense}
        class:q-expansion-item__content--expressive={ctx.expressive}
      >
        {#if value || hasOpened}
          {@render children?.()}
        {/if}
      </div>
    </div>
  </div>
</div>
