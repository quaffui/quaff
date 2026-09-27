<!--
@component
Choose colors in a popup or inline, with HEX, RGB and optional opacity controls.
-->

<script lang="ts">
  import { tick, untrack } from "svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QInput from "$components/input/QInput.svelte";
  import { maskValue, unmaskValue } from "$components/input/mask";
  import QMenu from "$components/menu/QMenu.svelte";
  import { useI18n } from "$internal/i18n.svelte";
  import QColorPanel from "./QColorPanel.svelte";
  import { formatColor, parseColor } from "./color";
  import type { QColorPickerProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable<string | null | undefined>(),
    open = $bindable(false),
    inline = false,
    format = "hex",
    alpha = false,
    disabled = false,
    readonly = false,
    labels: providedLabels,
    name,
    class: userClass,
    style,
    ...fieldProps
  }: QColorPickerProps = $props();
  // #endregion: --- Props

  // #region:    --- State
  const i18n = useI18n("colorPicker");
  const componentId = $props.id();
  const popupId = `q-color-popup-${componentId}`;
  const titleId = `q-color-title-${componentId}`;
  const errorId = `q-color-field-error-${componentId}`;
  let root: HTMLDivElement;
  let fieldText = $state(untrack(() => formatFieldValue(value)));
  let draft = $state(untrack(() => value));
  let hasInputError = $state(untrack(() => !!value && !parseColor(value)));
  let wasOpen = false;
  let returnFocus: HTMLElement | undefined;
  const labels = $derived({ ...i18n.labels, ...providedLabels });
  const parsedValue = $derived(parseColor(value));
  const preview = $derived(parsedValue ? formatColor(parsedValue, "rgb", alpha) : "transparent");
  const fieldError = $derived(fieldProps.error || hasInputError);
  const fieldDescription = $derived(
    [fieldProps["aria-describedby"], hasInputError ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined
  );
  // #endregion: --- State

  // #region:    --- Effects
  $effect(() => {
    fieldText = formatFieldValue(value);
    hasInputError = !!value && !parsedValue;
  });

  $effect(() => {
    if (!inline) {
      root?.querySelector("input")?.setCustomValidity(hasInputError ? labels.invalidColor : "");
    }
  });

  $effect(() => {
    if ((disabled || readonly || inline) && open) {
      open = false;
    }
  });

  $effect.pre(() => {
    if (open === wasOpen) {
      return;
    }

    wasOpen = open;

    untrack(() => {
      if (open) {
        draft = value;
        returnFocus =
          document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
        void focusPopup();
      } else {
        const popup = document.getElementById(popupId);

        if (popup?.contains(document.activeElement)) {
          returnFocus?.focus({ preventScroll: true });
        }
      }
    });
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Opens the popup unless the picker is inline, disabled or readonly. */
  export function show() {
    if (!inline && !disabled && !readonly) {
      open = true;
    }
  }

  /** Closes the popup and discards its draft. */
  export function hide() {
    open = false;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function formatFieldValue(nextValue: string | null | undefined) {
    const parsed = parseColor(nextValue);
    return fieldProps.mask && parsed
      ? maskValue(
          formatColor(parsed, "hex", alpha).slice(1),
          fieldProps.mask,
          fieldProps.fillMask,
          true
        )
      : (nextValue ?? "");
  }

  async function focusPopup() {
    await tick();

    if (open) {
      document
        .getElementById(popupId)
        ?.querySelector<HTMLInputElement>("input")
        ?.focus({ preventScroll: true });
    }
  }

  function commitField() {
    if (readonly || disabled) {
      return;
    }

    const { mask, fillMask } = fieldProps;
    const text = mask ? unmaskValue(fieldText, mask, fillMask) : fieldText;
    // Require every mask position; stripping placeholders alone could turn a partial into short HEX.
    const complete =
      !mask || maskValue(text, mask, false, true).length === maskValue("", mask, true).length;
    const parsed =
      complete && (!mask || text.length === 6 || text.length === 8) ? parseColor(text) : undefined;
    hasInputError = !!text && !parsed;

    if (!hasInputError) {
      if (parsed && mask && alpha && text.length === 6) {
        parsed.alpha = parsedValue?.alpha ?? 1;
      }

      value = parsed ? formatColor(parsed, format, alpha) : null;
      fieldText = formatFieldValue(value);
    }
  }

  function handleFieldKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      show();
    } else if (event.key === "Enter") {
      event.preventDefault();
      commitField();
    }
  }

  function handlePopupFocusout(event: FocusEvent) {
    const nextTarget = event.relatedTarget;
    const popup = event.currentTarget as HTMLElement;

    if (nextTarget instanceof Node && !popup.contains(nextTarget) && !root.contains(nextTarget)) {
      hide();
    }
  }

  function applyDraft() {
    value = draft;
    fieldText = formatFieldValue(draft);
    hasInputError = false;
    hide();
  }
  // #endregion: --- Functions

  Q.classes("q-color-picker", { bemClasses: { inline, disabled, readonly }, classes: [userClass] });
</script>

<div bind:this={root} class="q-color-picker" {style} data-quaff>
  {#if inline}
    <div
      class="q-color-picker__panel"
      role="group"
      id={fieldProps.id}
      aria-label={fieldProps["aria-label"] ?? fieldProps.label ?? labels.chooseColor}
      aria-describedby={fieldProps["aria-describedby"]}
    >
      <QColorPanel bind:value {format} {alpha} {disabled} {readonly} {labels} />
    </div>
  {:else}
    <QInput
      {...fieldProps}
      outlined={!fieldProps.rounded && (fieldProps.outlined ?? !fieldProps.filled)}
      bind:value={fieldText}
      dir="ltr"
      aria-label={fieldProps["aria-label"] ?? fieldProps.label ?? labels.chooseColor}
      aria-invalid={fieldError || undefined}
      aria-describedby={fieldDescription}
      error={fieldError}
      {disabled}
      {readonly}
      spellcheck={false}
      autocomplete="off"
      onchange={commitField}
      onkeydown={handleFieldKeydown}
    >
      {#snippet append()}
        <QIconBtn
          type="button"
          expressive={false}
          size="lg"
          flat
          aria-label={labels.chooseColor}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popupId : undefined}
          disabled={disabled || readonly}
          onclick={(event) => {
            event.preventDefault();
            open ? hide() : show();
          }}
        >
          {#snippet icon()}
            <span
              class="q-color-picker__swatch"
              style:--q-color-preview={preview}
              aria-hidden="true"
            ></span>
          {/snippet}
        </QIconBtn>
      {/snippet}
    </QInput>
    <p id={errorId} class="q-color-picker__error" role="status" aria-atomic="true">
      {hasInputError ? labels.invalidColor : ""}
    </p>
    <QMenu
      bind:value={open}
      id={popupId}
      role="dialog"
      aria-labelledby={titleId}
      class="q-color-picker__popup"
      autoClose={false}
      flip
      onfocusout={handlePopupFocusout}
    >
      <div class="q-color-picker__panel">
        <h2 id={titleId} class="q-color-picker__title">{labels.chooseColor}</h2>
        <QColorPanel
          bind:value={draft}
          {format}
          {alpha}
          {disabled}
          {readonly}
          {labels}
          onapply={applyDraft}
          oncancel={hide}
        />
      </div>
    </QMenu>
  {/if}
  {#if name}
    <input type="hidden" {name} {value} {disabled} />
  {/if}
</div>
