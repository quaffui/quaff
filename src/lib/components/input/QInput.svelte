<script lang="ts">
  import type { QEvent } from "$utils";
  import type { QInputProps } from "./props";

  type QInputFocusEvent = QEvent<FocusEvent, HTMLInputElement>;

  // #region:    --- Reactive variables
  let focus = $state(false);

  let snippetPrependWidth = $state(0);
  // #endregion: --- Reactive variables

  // #region:    --- Props
  let {
    dense = false,
    disable = false,
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
    ...inputProps
  }: QInputProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const hasValue = $derived(value !== "" && value !== undefined && value !== null);
  const hasNativePlaceholder = $derived(
    ["date", "datetime-local", "month", "time", "week"].includes(String(type))
  );
  const active = $derived(hasValue || focus || !!placeholder || hasNativePlaceholder);
  // #endregion: --- Derived values

  // #region:    --- Functions
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
      disable,
      error,
    },
    classes: [userClass, "q-input"],
  });
</script>

<div
  class="q-field"
  {style}
  style:--snippet-prepend-width="{snippetPrependWidth}px"
  aria-disabled={disable || undefined}
  data-quaff
>
  {#if before}
    <div class="q-field__snippet-before">
      {@render before()}
    </div>
  {/if}

  <div class="q-field__inner">
    <label class="q-field__wrapper">
      {#if prepend}
        <div class="q-field__snippet-prepend" bind:clientWidth={snippetPrependWidth}>
          {@render prepend()}
        </div>
      {/if}
      <input
        {...inputProps}
        class="q-field__input"
        bind:value
        {placeholder}
        {type}
        onfocus={onFocus}
        onblur={onBlur}
        disabled={disable}
        tabindex={disable === true ? -1 : (tabindex ?? 0)}
      />
      <span class="q-field__label">{label}</span>

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
