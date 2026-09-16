<script lang="ts">
  import { tick } from "svelte";
  import QAvatar from "$components/avatar/QAvatar.svelte";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import { ripple } from "$helpers";
  import { handleActivationKeydown, type QEvent } from "$utils";
  import type { QChipProps } from "./props";

  type QChipMouseEvent = QEvent<MouseEvent, HTMLElement>;

  // #region:    --- Props
  let {
    kind = "assist",
    selected = $bindable(kind === "filter" ? false : undefined),
    value = $bindable(),
    label,
    icon,
    trailingIcon,
    trailingIconLabel,
    disabled = false,
    elevated,
    noRipple = false,
    size = "sm",
    onTrailingIconClick,
    children,
    ...props
  }: QChipProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let isEditing = $state(false);
  let editInput = $state<HTMLInputElement>();
  let qChip = $state<HTMLDivElement>();
  let primaryAction = $state<HTMLButtonElement>();
  let trailingAction = $state<HTMLButtonElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const trailing = $derived(kind === "filter" || kind === "input" ? trailingIcon : undefined);
  const hasTrailingAction = $derived(!!trailing && !!onTrailingIconClick);
  const isRemoveOnly = $derived(
    kind === "input" && hasTrailingAction && value === undefined && !props.onclick
  );
  const hasSecondaryAction = $derived(hasTrailingAction && !isRemoveOnly);
  const trailingLabel = $derived(
    trailingIconLabel || (isRemoveOnly ? props["aria-label"] : undefined)
  );
  const trailingLabelledby = $derived.by(() => {
    if (trailingIconLabel) {
      return undefined;
    }

    if (isRemoveOnly && props["aria-labelledby"]) {
      return props["aria-labelledby"];
    }

    return trailingLabel ? undefined : `${id}-action ${id}-label`;
  });

  const tabindex = $derived(disabled ? -1 : (props.tabindex ?? 0));
  const hasElevation = $derived(elevated && kind !== "input");

  const iconSize = $derived(size === "sm" ? 18 : size === "md" ? 22.5 : 27);
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect.pre(() => {
    if (selected !== undefined && kind !== "filter") {
      throw new Error('Only QChips of kind "filter" can use the "selected" prop.');
    }

    if ((kind === "assist" || kind === "suggestion") && trailingIcon) {
      console.warn(
        'QChips of kind "assist" and "suggestion" should not have a trailing icon. It will thus be ignored.'
      );
    }

    if (kind === "input" && elevated) {
      console.warn('QChips of kind "input" do not support the "elevated" prop.');
    }
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  async function handleClick(e: QChipMouseEvent, isTrailingAction = false) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    e.stopPropagation();

    if (isTrailingAction) {
      onTrailingIconClick?.(e);
    } else {
      props.onclick?.(e as QEvent<MouseEvent, HTMLDivElement>);
    }

    if (e.defaultPrevented) {
      return;
    }

    if (kind === "filter" && !isTrailingAction) {
      selected = !selected;
    } else if (kind === "input" && !isTrailingAction && value !== undefined) {
      isEditing = true;
    }

    if (isEditing) {
      await tick();
      editInput?.focus();
      editInput?.select();
    }
  }

  function onkeydown(e: QEvent<KeyboardEvent, HTMLDivElement>) {
    if (disabled) {
      return;
    }

    props.onkeydown?.(e);

    if (
      e.defaultPrevented ||
      (e.target !== qChip && e.target !== primaryAction && e.target !== trailingAction)
    ) {
      return;
    }

    if (kind === "input" && hasTrailingAction && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();

      if (!e.repeat) {
        (isRemoveOnly ? qChip : trailingAction)?.click();
      }

      return;
    }

    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
      return;
    }

    handleActivationKeydown(e);
  }

  function handleFocusCapture(e: QEvent<FocusEvent, HTMLDivElement>, type: "focus" | "blur") {
    props[`on${type}capture`]?.(e);

    if (!e.cancelBubble && (e.target === primaryAction || e.target === trailingAction)) {
      props[`on${type}`]?.(e);
    }
  }

  async function onInputKeydown(e: KeyboardEvent) {
    e.stopPropagation();

    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      isEditing = false;
      await tick();
      (primaryAction ?? qChip)?.focus();
    }
  }
  // #endregion: --- Functions

  Q.classes("q-chip", {
    bemClasses: {
      [kind]: true,
      [size]: true,
      selected: kind === "filter" && selected,
      elevated: hasElevation,
    },
    classes: [props.class],
  });
</script>

{#if isEditing}
  <input
    bind:this={editInput}
    class={["q-chip__edit", props.class]}
    bind:value
    size={Math.max(value?.length ?? 0, 1)}
    aria-label={label ?? value}
    onblur={() => (isEditing = false)}
    onkeydown={onInputKeydown}
  />
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (only the button role receives a tabindex) -->
  <div
    bind:this={qChip}
    {@attach ripple({ disabled: noRipple || disabled })}
    {...props}
    class="q-chip"
    aria-disabled={disabled || undefined}
    aria-pressed={!hasSecondaryAction && kind === "filter" ? selected : undefined}
    aria-label={isRemoveOnly ? trailingLabel : props["aria-label"]}
    aria-labelledby={isRemoveOnly ? trailingLabelledby : props["aria-labelledby"]}
    tabindex={hasSecondaryAction ? undefined : tabindex}
    role={hasSecondaryAction ? "group" : "button"}
    onclick={(e) => handleClick(e, isRemoveOnly)}
    {onkeydown}
    onfocuscapture={(e) => handleFocusCapture(e, "focus")}
    onblurcapture={(e) => handleFocusCapture(e, "blur")}
    data-quaff
  >
    {#snippet content()}
      <QIconSnippet
        class="q-chip__leading-icon"
        icon={kind === "filter" && selected ? "check" : icon || undefined}
        size={iconSize}
        aria-hidden="true"
      >
        {#snippet image(src)}
          <QAvatar class="q-chip__avatar" {src} aria-hidden="true" />
        {/snippet}
      </QIconSnippet>

      <span id={`${id}-label`} class="q-chip__label">
        {#if label}
          {label}
        {:else if kind === "input" && value !== undefined}
          {value}
        {:else}
          {@render children?.()}
        {/if}
      </span>
    {/snippet}

    {#if hasSecondaryAction}
      <button
        bind:this={primaryAction}
        class="q-chip__primary"
        type="button"
        {disabled}
        {tabindex}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        aria-haspopup={props["aria-haspopup"]}
        aria-expanded={props["aria-expanded"]}
        aria-controls={props["aria-controls"]}
        aria-pressed={kind === "filter" ? selected : undefined}
      >
        <span class="q-chip__touch-target" aria-hidden="true"></span>
        {@render content()}
      </button>
      <button
        bind:this={trailingAction}
        class="q-chip__trailing-action"
        type="button"
        {disabled}
        {tabindex}
        aria-label={trailingIconLabel}
        aria-labelledby={trailingLabelledby}
        onclick={(e) => handleClick(e, true)}
      >
        <QIconSnippet
          class="q-chip__trailing-icon"
          icon={trailing}
          size={iconSize}
          aria-hidden="true"
        />
      </button>
    {:else}
      <span class="q-chip__touch-target" aria-hidden="true"></span>
      {@render content()}
      <QIconSnippet
        class="q-chip__trailing-icon"
        icon={trailing || undefined}
        size={iconSize}
        aria-hidden="true"
      />
    {/if}

    {#if hasTrailingAction && !trailingIconLabel}
      <span id={`${id}-action`} hidden>{kind === "input" ? "Remove" : "Options for"}</span>
    {/if}
  </div>
{/if}
