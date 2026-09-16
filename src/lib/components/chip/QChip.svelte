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
    disabled = false,
    elevated,
    noRipple = false,
    size = "sm",
    onTrailingIconClick,
    children,
    ...props
  }: QChipProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let editing = $state(false);
  let editInput = $state<HTMLInputElement>();
  let inputSelected = $state(false);
  let qChip = $state<HTMLDivElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const trailing = $derived(kind === "filter" || kind === "input" ? trailingIcon : undefined);
  const chipSelected = $derived(kind === "filter" ? selected : inputSelected);

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
  async function handleClick(e: QChipMouseEvent, iconClick = false) {
    if (disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    e.stopPropagation();

    if (iconClick) {
      onTrailingIconClick?.(e);
    } else {
      props.onclick?.(e as QEvent<MouseEvent, HTMLDivElement>);
    }

    if (e.defaultPrevented) {
      return;
    }

    if (kind === "input" && iconClick) {
      inputSelected = false;
    } else if (kind === "filter" && !iconClick) {
      selected = !selected;
    } else if (kind === "input" && !iconClick && value !== undefined) {
      inputSelected = false;
      editing = true;
    }

    if (editing) {
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

    if (e.defaultPrevented || e.target !== e.currentTarget) {
      return;
    }

    if (kind === "input" && e.key === "Backspace") {
      e.preventDefault();

      if (inputSelected) {
        qChip?.querySelector<HTMLElement>(".q-chip__trailing-icon")?.click();
      } else {
        inputSelected = true;
      }
      return;
    }

    if (e.key === "Escape") {
      inputSelected = false;
      qChip?.blur();
      return;
    }

    handleActivationKeydown(e);
  }

  async function onInputKeydown(e: KeyboardEvent) {
    e.stopPropagation();

    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      editing = false;
      await tick();
      qChip?.focus();
    }
  }

  function onblur(e: QEvent<FocusEvent, HTMLDivElement>) {
    inputSelected = false;
    props.onblur?.(e);
  }
  // #endregion: --- Functions

  Q.classes("q-chip", {
    bemClasses: {
      [kind]: true,
      [size]: true,
      selected: chipSelected,
      elevated: hasElevation,
    },
    classes: [props.class],
  });
</script>

{#if editing}
  <input
    bind:this={editInput}
    class={["q-chip__edit", props.class]}
    bind:value
    size={Math.max(value?.length ?? 0, 1)}
    aria-label={label ?? value}
    onblur={() => (editing = false)}
    onkeydown={onInputKeydown}
  />
{:else}
  <div
    bind:this={qChip}
    {@attach ripple({ disabled: noRipple || disabled })}
    {...props}
    class="q-chip"
    aria-disabled={disabled || undefined}
    aria-pressed={kind === "filter" || kind === "input" ? chipSelected : undefined}
    {tabindex}
    role="button"
    onclick={handleClick}
    {onkeydown}
    {onblur}
    data-quaff
  >
    <span class="q-chip__touch-target" aria-hidden="true"></span>

    <QIconSnippet
      class="q-chip__leading-icon"
      icon={kind === "filter" && selected ? "check" : icon || undefined}
      size={iconSize}
    >
      {#snippet image(src)}
        <QAvatar class="q-chip__avatar" {src} />
      {/snippet}
    </QIconSnippet>

    <div class="q-chip__label">
      {#if label}
        {label}
      {:else if kind === "input" && value !== undefined}
        {value}
      {:else}
        {@render children?.()}
      {/if}
    </div>

    {#if trailing}
      <QIconSnippet
        class="q-chip__trailing-icon"
        icon={trailing}
        size={iconSize}
        onclick={(e) => handleClick(e, true)}
      />
    {/if}
  </div>
{/if}
