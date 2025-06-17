<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { QIcon } from "$lib";
  import type { QEvent } from "$utils";
  import type { QSelectOption, QSelectProps } from "./props";

  type QSelectEvent<T> = QEvent<T, HTMLDivElement>;

  let {
    options,
    multiple = false,
    dense = false,
    disable = false,
    error = false,
    errorMessage = undefined,
    filled = false,
    hint = undefined,
    label = undefined,
    outlined = false,
    rounded = false,
    displayValue,
    emitValue = false,
    before = undefined,
    prepend = undefined,
    append = undefined,
    after = undefined,
    value = $bindable(),
    ...props
  }: QSelectProps = $props();

  let focus = $state(false);

  const currentDisplayValue = $derived.by(() => {
    if (displayValue !== undefined) {
      return displayValue;
    }

    const getOptionPropFn = emitValue ? getOptionValue : getOptionLabel;

    if (!multiple) {
      return getOptionPropFn(value as QSelectOption);
    }

    return (value as QSelectOption[]).map((val) => getOptionPropFn(val)).join(", ");
  });

  const active = $derived(currentDisplayValue || focus);

  let wrapper: HTMLDivElement | null = $state(null);
  let isMenuOpen = $state(false);
  let wasClicked = $state(false);
  let preventClose = $state(false);

  function handleMousedown(e: QSelectEvent<MouseEvent>) {
    isMenuOpen = !isMenuOpen;
    wasClicked = true;
    props.onmousedown?.(e);
  }

  function handleFocus(e: QSelectEvent<FocusEvent>) {
    focus = true;
    if (!wasClicked) {
      isMenuOpen = true;
    }

    wasClicked = false;
    props.onfocus?.(e);
  }

  function handleBlur(e: QSelectEvent<FocusEvent>) {
    focus = false;

    if (!multiple && !preventClose) {
      isMenuOpen = false;
    }
    preventClose = false;
    props.onblur?.(e);
  }

  const selectedOptions: boolean[] = $derived(options.map((option) => isSelected(option), value));

  let snippetPrependWidth = $state(0);

  function compareValues<T extends QSelectOption>(a: T, b: T) {
    return getOptionValue(a) === getOptionValue(b);
  }

  function getOptionValue(option: QSelectOption) {
    return typeof option === "object" ? option.value : option;
  }

  function getOptionLabel(option: QSelectOption) {
    if (typeof option !== "string" && typeof option !== "number") {
      return option.label;
    }

    return options.includes(option)
      ? option
      : (options.find((opt) => compareValues(opt, option)) as { label: string | number })?.label ||
          "";
  }

  function isSelected(option: QSelectOption) {
    return multiple
      ? (value as QSelectOption[]).some((opt) => compareValues(opt, option))
      : compareValues(value as QSelectOption, option);
  }

  function select(evt: MouseEvent, option: QSelectOption) {
    evt.preventDefault();
    const optionValue = getOptionValue(option);

    if (multiple) {
      const index = (value as QSelectOption[]).findIndex((entry) =>
        compareValues(entry, optionValue)
      );

      if (index !== -1) {
        (value as QSelectOption[]).splice(index, 1);
      } else {
        (value as QSelectOption[]).push(emitValue ? optionValue : option);
      }

      return;
    }

    value = emitValue ? optionValue : option;
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

  // q-field here, q-select in classes
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
      "bottom-space": hint || (error && errorMessage),
    },
    classes: [props.class, "q-select"],
  });
</script>

<div
  bind:this={wrapper}
  {...props}
  class="q-field"
  style:--snippet-prepend-width="{snippetPrependWidth}px"
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
        class="q-field__input"
        value={currentDisplayValue}
        placeholder=""
        onfocus={handleFocus}
        onblur={handleBlur}
        onmousedown={handleMousedown}
        disabled={disable}
        tabindex={disable === true ? -1 : 0}
        readonly
      />

      <span class="q-field__label">{label}</span>

      <div class="q-field__snippet-append">
        {@render append?.()}

        <QIcon
          class="q-select__arrow-toggle {append ? 'q-select__arrow-toggle--has-append' : ''}"
          name={`arrow_drop_${isMenuOpen ? "up" : "down"}`}
        />
      </div>
    </label>

    <div class="q-select__menu {isMenuOpen ? 'q-select__menu--active' : ''}">
      {#each options as option, idx (idx)}
        <a
          href={multiple ? "javascript:void(0)" : undefined}
          class="q-select__option {selectedOptions[idx] ? 'q-select__option--selected' : ''}"
          onmousedown={() => (preventClose = true)}
          onclick={(e) => select(e, option)}>{getOptionLabel(option)}</a
        >
      {/each}
    </div>

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
