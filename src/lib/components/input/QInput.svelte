<script lang="ts">
  import { type QEvent } from "$utils";
  import { deleteMaskedToken, maskCaretPosition, maskValue, unmaskValue } from "./mask";
  import type { QInputProps } from "./props";

  type QInputFocusEvent = QEvent<FocusEvent, HTMLInputElement>;
  type QInputInputEvent = QEvent<Event, HTMLInputElement>;
  type QInputBeforeInputEvent = QEvent<InputEvent, HTMLInputElement>;

  // #region:    --- Reactive variables
  let focus = $state(false);

  let snippetPrependWidth = $state(0);
  let pendingDeletion:
    { event: InputEvent; result: NonNullable<ReturnType<typeof deleteMaskedToken>> } | undefined;
  // #endregion: --- Reactive variables

  // #region:    --- Props
  let {
    dense = false,
    disabled = false,
    error = false,
    errorMessage = undefined,
    filled = false,
    hint = undefined,
    label = undefined,
    outlined = false,
    rounded = false,
    before = undefined,
    prepend = undefined,
    append = undefined,
    after = undefined,
    value = $bindable(),
    class: userClass,
    style,
    onfocus,
    onblur,
    placeholder = "",
    tabindex,
    type,
    mask,
    fillMask,
    unmaskedValue = false,
    oninput,
    onbeforeinput,
    ...inputProps
  }: QInputProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const inputId = $derived(inputProps.id ?? `q-input-${id}`);
  const nativeValue = $derived(value ?? "");
  const displayValue = $derived(
    mask ? maskValue(String(nativeValue), mask, fillMask) : nativeValue
  );
  const hasValue = $derived(value !== "" && value !== undefined && value !== null);
  const hasNativePlaceholder = $derived(
    ["date", "datetime-local", "month", "time", "week"].includes(String(type))
  );
  const active = $derived(
    hasValue || focus || !!placeholder || hasNativePlaceholder || (!!mask && fillMask !== undefined)
  );
  const inputType = $derived(mask ? (type ?? "text") : type);
  // #endregion: --- Derived values

  // #region:    --- Functions
  function setCaret(input: HTMLInputElement, position: number) {
    try {
      input.setSelectionRange(position, position);
    } catch {
      // Some native input types do not support text selection.
    }
  }

  function onInput(event: QInputInputEvent) {
    const input = event.currentTarget;
    const deletion = pendingDeletion?.event.defaultPrevented ? undefined : pendingDeletion?.result;
    pendingDeletion = undefined;

    if (!mask) {
      if (type === "number" || type === "range") {
        value = Number.isNaN(input.valueAsNumber) ? "" : input.valueAsNumber;
      } else {
        value = input.value;
      }
      oninput?.(event);
      return;
    }

    const cursor = input.selectionStart ?? input.value.length;
    const previousDisplayLength = String(displayValue).length;
    const masked = deletion?.masked ?? maskValue(input.value, mask, fillMask);
    const unmasked = deletion?.unmasked ?? unmaskValue(masked, mask, fillMask);
    const tokenCount =
      fillMask !== undefined && fillMask !== false && cursor > previousDisplayLength
        ? unmasked.length
        : unmaskValue(input.value.slice(0, cursor), mask, fillMask).length;
    const nextCaret = deletion?.caret ?? maskCaretPosition(tokenCount, mask, masked.length);

    input.value = masked;
    value = unmaskedValue ? unmasked : masked;
    setCaret(input, nextCaret);
    queueMicrotask(() => setCaret(input, nextCaret));
    oninput?.(event);
  }

  function onBeforeInput(event: QInputBeforeInputEvent) {
    pendingDeletion = undefined;
    onbeforeinput?.(event);

    if (
      event.defaultPrevented ||
      !mask ||
      (event.inputType !== "deleteContentBackward" && event.inputType !== "deleteContentForward")
    ) {
      return;
    }

    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (input.readOnly || start === null || end === null || start !== end) {
      return;
    }

    const deletion = deleteMaskedToken(
      input.value,
      mask,
      start,
      event.inputType === "deleteContentBackward" ? "backward" : "forward",
      fillMask
    );

    if (deletion) {
      pendingDeletion = { event, result: deletion };
    }
  }

  function onFocus(e: QInputFocusEvent) {
    focus = true;
    onfocus?.(e);
  }

  function onBlur(e: QInputFocusEvent) {
    focus = false;
    onblur?.(e);
  }
  // #endregion: --- Functions

  // q-field here, q-input in classes
  Q.classes("q-field", {
    bemClasses: {
      default: !outlined && !rounded && !filled,
      outlined,
      rounded,
      filled,
      "has-border": outlined || rounded,
      dense,
      active,
      focus,
      label,
      "snippet-append": !!append,
      "snippet-prepend": !!prepend,
      disabled,
      error,
    },
    classes: [userClass, "q-input"],
  });
</script>

<div
  class="q-field"
  {style}
  style:--snippet-prepend-width="{snippetPrependWidth}px"
  aria-disabled={disabled || undefined}
  data-quaff
>
  {#if before}
    <div class="q-field__snippet-before">
      {@render before()}
    </div>
  {/if}

  <div class="q-field__inner">
    <label for={inputId} class="q-field__wrapper">
      {#if prepend}
        <div class="q-field__snippet-prepend" bind:clientWidth={snippetPrependWidth}>
          {@render prepend()}
        </div>
      {/if}
      <input
        {...inputProps}
        id={inputId}
        class="q-field__input"
        value={displayValue}
        {placeholder}
        type={inputType}
        oninput={onInput}
        onbeforeinput={onBeforeInput}
        onfocus={onFocus}
        onblur={onBlur}
        {disabled}
        tabindex={disabled === true ? -1 : (tabindex ?? 0)}
      />
      <span class="q-field__label"><span class="q-field__label-text">{label}</span></span>

      {#if append}
        <div class="q-field__snippet-append">
          {@render append()}
        </div>
      {/if}
    </label>

    {#if error && errorMessage}
      <div class="q-field__error">{errorMessage}</div>
    {:else if hint}
      <div class="q-field__hint">{hint}</div>
    {/if}
  </div>

  {#if after}
    <div class="q-field__snippet-after">
      {@render after()}
    </div>
  {/if}
</div>
