<script lang="ts">
  import { QEvent } from "$utils";

  type QInputFocusEvent = QEvent<FocusEvent, HTMLDivElement>;

  let focus = $state(false);

  let snippetPrependWidth = $state(0);

  import type { QInputProps } from "../input/props";

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
    ...props
  }: QInputProps = $props();

  const active = $derived(value || focus);

  function onFocus(e: QInputFocusEvent) {
    focus = true;
    props.onfocus?.(e);
  }

  function onBlur(e: QInputFocusEvent) {
    focus = false;
    props.onblur?.(e);
  }

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
    classes: [props.class, "q-input"],
  });
</script>

<div
  {...props}
  class="q-field"
  {...Q.classes}
  style:--snippet-prepend-width="{snippetPrependWidth}px"
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
        class="q-field__input"
        bind:value
        placeholder=""
        onfocus={onFocus}
        onblur={onBlur}
        disabled={disable}
        tabindex={disable === true ? -1 : 0}
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
