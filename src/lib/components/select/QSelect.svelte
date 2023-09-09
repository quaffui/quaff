<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";
  import { QIcon } from "$lib";
  import type { QSelectProps, QSelectOption, QSelectMultipleValue } from "./props";

  export let options: QSelectProps["options"],
    multiple: QSelectProps["multiple"] = false,
    dense: QSelectProps["dense"] = false,
    disable: QSelectProps["disable"] = false,
    error: QSelectProps["error"] = false,
    errorMessage: QSelectProps["errorMessage"] = undefined,
    filled: QSelectProps["filled"] = false,
    hint: QSelectProps["hint"] = undefined,
    label: QSelectProps["label"] = undefined,
    outlined: QSelectProps["outlined"] = false,
    rounded: QSelectProps["rounded"] = false,
    value: QSelectProps["value"],
    userClasses: QSelectProps["userClasses"] = undefined;
  export { userClasses as class };

  let focus = false;
  let active = false;

  $: active = typeof value === "number" || value?.length > 0 || focus;

  let wrapper: HTMLElement | null = null;
  let isMenuOpen = false;
  let wasClicked = false;
  let preventClose = false;

  function handleMousedown() {
    isMenuOpen = !isMenuOpen;
    wasClicked = true;
  }

  function handleFocus() {
    focus = true;
    if (!wasClicked) {
      isMenuOpen = true;
    }

    wasClicked = false;
  }

  function handleBlur() {
    focus = false;

    if (!multiple && !preventClose) {
      isMenuOpen = false;
    }
    preventClose = false;
  }

  let selectedOptions: boolean[] = [];

  $: selectedOptions = options.map((option) => isSelected(option), value);

  let slotPrependWidth = 0;

  function isSelected(option: QSelectOption) {
    const optionValue = typeof option === "string" ? option : option.value;
    return multiple ? (value as QSelectMultipleValue).includes(optionValue) : value === optionValue;
  }

  function select(evt: MouseEvent, option: QSelectOption) {
    evt.preventDefault();
    const optionValue = typeof option === "string" ? option : option.value;

    if (multiple) {
      const hasItem = (value as QSelectMultipleValue).some((entry) => entry === optionValue);

      if (hasItem) {
        (value as QSelectMultipleValue) = (value as QSelectMultipleValue).filter(
          (val) => val !== optionValue
        );
      } else {
        (value as QSelectMultipleValue) = [...(value as QSelectMultipleValue), optionValue];
      }

      return;
    }

    value = optionValue;
    isMenuOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (wrapper && !wrapper.contains(event.target as Node)) {
      isMenuOpen = false;
    }
  }

  onMount(() => {
    if (browser) {
      window.document.addEventListener("click", handleClickOutside);
    }
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<div
  class="q-select q-field {userClasses}"
  class:q-field--default={!outlined && !rounded && !filled}
  class:q-field--outlined={outlined}
  class:q-field--rounded={rounded}
  class:q-field--filled={filled}
  class:q-field--has-border={outlined || rounded}
  class:q-field--dense={dense}
  class:q-field--active={active}
  class:q-field--focus={focus}
  class:q-field--label={label}
  class:q-field--slot-append={$$slots.append}
  class:q-field--slot-prepend={$$slots.prepend}
  class:q-field--disable={disable}
  class:q-field--error={error}
  class:q-field--bottom-space={hint || (error && errorMessage)}
  style:--slot-prepend-width="{slotPrependWidth}px"
  {...$$restProps}
>
  {#if $$slots.before}
    <div class="q-field__slot-before">
      <slot name="before" />
    </div>
  {/if}

  <div class="q-field__inner">
    <label class="q-field__wrapper">
      {#if $$slots.prepend}
        <div class="q-field__slot-prepend" bind:clientWidth={slotPrependWidth}>
          <slot name="prepend" />
        </div>
      {/if}

      <input
        class="q-field__input"
        bind:value
        placeholder=""
        on:focus={handleFocus}
        on:blur={handleBlur}
        on:mousedown={handleMousedown}
        disabled={disable}
        tabindex={disable === true ? -1 : 0}
        readonly
      />

      <span class="q-field__label">{label}</span>

      <div class="q-field__slot-append">
        <slot name="append" />

        <QIcon
          class="q-select__arrow-toggle {$$slots.append
            ? 'q-select__arrow-toggle--has-append'
            : ''}"
          name={`arrow_drop_${isMenuOpen ? "up" : "down"}`}
        />
      </div>
    </label>

    <div class="q-select__menu {isMenuOpen ? 'q-select__menu--active' : ''}">
      {#each options as option, idx}
        <a
          href={multiple ? "javascript:void(0)" : undefined}
          class="q-select__option {selectedOptions[idx] ? 'q-select__option--selected' : ''}"
          on:mousedown={() => (preventClose = true)}
          on:click={(e) => select(e, option)}
          >{typeof option === "string" ? option : option.value}</a
        >
      {/each}
    </div>

    {#if error && errorMessage}
      <div class="q-field__error">{errorMessage}</div>
    {:else if hint}
      <div class="q-field__hint">{hint}</div>
    {/if}
  </div>

  {#if $$slots.after}
    <div class="q-field__slot-after">
      <slot name="after" />
    </div>
  {/if}
</div>
