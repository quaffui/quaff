<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import QIcon from "$components/icon/QIcon.svelte";
  import QItem from "$components/list/QItem.svelte";
  import QItemSection from "$components/list/QItemSection.svelte";
  import QList from "$components/list/QList.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import { createFilterRunner, getFilteredOptions, getInputValue } from "./filter";
  import {
    doValuesMatch,
    getDisplayValue,
    getInitialOptionIndex,
    getNextValue,
    getOptionLabel,
    getOptionValue,
    normalizeOptionIndex,
  } from "./option";
  import type { QSelectOption, QSelectProps } from "./props";

  type QSelectEvent<T extends Event> = QEvent<T, HTMLDivElement>;

  // #region:    --- Props
  let {
    options,
    multiple = false,
    dense = false,
    disabled = false,
    error = false,
    errorMessage = undefined,
    filled = false,
    hint = undefined,
    label = undefined,
    outlined = false,
    rounded = false,
    displayValue,
    emitValue = false,
    useInput = false,
    filterable = false,
    inputDebounce = 300,
    noOptionText = "No options",
    onFilter,
    before,
    prepend,
    append,
    after,
    value = $bindable(),
    ...props
  }: QSelectProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  const listboxId = `q-select__listbox-${id}`;
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let isFocused = $state(false);

  let menuTarget = $state<HTMLLabelElement>();
  let isMenuOpen = $state(false);
  let focusedOptionIndex = $state(-1);
  let snippetPrependWidth = $state(0);
  let searchValue = $state("");
  let isSearching = $state(false);
  // #endregion: --- Reactive variables

  const filterRunner = createFilterRunner({
    onAbort: resetFocusedOption,
    onDone: focusFirstOption,
  });

  // #region:    --- Derived values
  const currentDisplayValue = $derived(getDisplayValue(value, options, multiple, displayValue));

  const hasDisplayValue = $derived(currentDisplayValue !== "" && currentDisplayValue !== undefined);
  const isActive = $derived(hasDisplayValue || isFocused || isMenuOpen);

  const visibleOptions = $derived(
    getFilteredOptions(options, searchValue, useInput, filterable, !!onFilter)
  );
  const inputValue = $derived(
    getInputValue(currentDisplayValue, searchValue, useInput, isSearching)
  );

  const selectedOptionValues = $derived.by(() => {
    if (!multiple || !Array.isArray(value)) {
      return null;
    }

    return new Set(value.map(getOptionValue).filter((optionValue) => !Number.isNaN(optionValue)));
  });
  const isOptionSelectedByIndex = $derived(visibleOptions.map(isSelected));
  const activeOptionId = $derived(
    isMenuOpen && focusedOptionIndex >= 0 ? getOptionId(focusedOptionIndex) : undefined
  );
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    if (disabled) {
      isMenuOpen = false;
    }
  });

  $effect(() => {
    if (!isMenuOpen) {
      focusedOptionIndex = -1;
      resetSearch();
    }
  });

  $effect(() => {
    if (focusedOptionIndex >= visibleOptions.length) {
      focusedOptionIndex = visibleOptions.length ? visibleOptions.length - 1 : -1;
    }
  });
  // #endregion: --- Effects

  onDestroy(filterRunner.clear);

  // #region:    --- Functions
  function handleMousedown() {
    if (disabled) {
      return;
    }

    if (useInput) {
      void showMenu();
    } else if (isMenuOpen) {
      hideMenu();
    } else {
      void showMenu();
    }
  }

  function handleFocus(e: QSelectEvent<FocusEvent>) {
    isFocused = true;
    props.onfocus?.(e);
  }

  function handleBlur(e: QSelectEvent<FocusEvent>) {
    isFocused = false;
    props.onblur?.(e);
  }

  function handleKeydown(e: QSelectEvent<KeyboardEvent>) {
    if (disabled) {
      return;
    }

    const isSelectKey = useInput ? e.code === "Enter" : isActivationKey(e);

    if (isSelectKey) {
      e.preventDefault();
      e.stopPropagation();

      if (isMenuOpen && focusedOptionIndex !== -1) {
        selectOption(visibleOptions[focusedOptionIndex]);
      } else if (isMenuOpen) {
        hideMenu();
      } else {
        void showMenu();
      }
    } else if (e.code === "ArrowDown" || e.code === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      moveFocusedOption(e.code === "ArrowDown" ? 1 : -1);
    } else if (!useInput && (e.code === "Home" || e.code === "End")) {
      e.preventDefault();
      e.stopPropagation();

      if (!isMenuOpen) {
        isMenuOpen = true;
      }

      void setFocusedOptionIndex(e.code === "Home" ? 0 : visibleOptions.length - 1);
    } else if (e.code === "Escape" && isMenuOpen) {
      e.preventDefault();
      e.stopPropagation();
      hideMenu();
    } else if (e.code === "Tab") {
      hideMenu();
    }

    props.onkeydown?.(e);
  }

  function handleInput(e: Event) {
    if (!useInput) {
      return;
    }

    searchValue = (e.currentTarget as HTMLInputElement).value;
    isSearching = true;

    if (!isMenuOpen) {
      void showMenu(0);
    } else {
      void setFocusedOptionIndex(0);
    }

    filterRunner.schedule(searchValue, getExternalFilter(), inputDebounce);
  }

  async function showMenu(optionIndex = getInitialFocusedOptionIndex()) {
    isMenuOpen = true;
    await setFocusedOptionIndex(optionIndex);
  }

  function hideMenu() {
    isMenuOpen = false;
    focusedOptionIndex = -1;
  }

  function moveFocusedOption(offset: number) {
    if (!visibleOptions.length) {
      return;
    }

    if (!isMenuOpen) {
      void showMenu(getInitialFocusedOptionIndex(offset));
      return;
    }

    const baseIndex =
      focusedOptionIndex === -1 ? getInitialFocusedOptionIndex(offset) : focusedOptionIndex;

    void setFocusedOptionIndex(baseIndex + offset);
  }

  function getInitialFocusedOptionIndex(direction = 1) {
    if (!visibleOptions.length) {
      return -1;
    }

    return getInitialOptionIndex(visibleOptions, isSelected, direction);
  }

  async function setFocusedOptionIndex(optionIndex: number) {
    focusedOptionIndex = normalizeOptionIndex(optionIndex, visibleOptions.length);

    await tick();
    scrollFocusedOptionIntoView();
  }

  function resetFocusedOption() {
    focusedOptionIndex = -1;
  }

  function focusFirstOption() {
    return setFocusedOptionIndex(0);
  }

  function scrollFocusedOptionIntoView() {
    if (focusedOptionIndex === -1) {
      return;
    }

    document.getElementById(getOptionId(focusedOptionIndex))?.scrollIntoView({ block: "nearest" });
  }

  function getOptionId(optionIndex: number) {
    return `${listboxId}__option-${optionIndex}`;
  }

  function isSelected(option: QSelectOption) {
    if (multiple) {
      return selectedOptionValues?.has(getOptionValue(option)) ?? false;
    }

    return !Array.isArray(value) && doValuesMatch(value, option);
  }

  function handleOptionMousedown(evt: MouseEvent) {
    evt.preventDefault();
  }

  function handleOptionClick(evt: MouseEvent, option: QSelectOption, optionIndex: number) {
    evt.preventDefault();
    focusedOptionIndex = optionIndex;
    selectOption(option);
  }

  function selectOption(option: QSelectOption) {
    value = getNextValue(value, option, multiple, emitValue);

    if (multiple) {
      resetSearch();
      return;
    }

    hideMenu();
  }

  function resetSearch() {
    if (!isSearching && !searchValue) {
      return;
    }

    searchValue = "";
    isSearching = false;
    filterRunner.schedule("", getExternalFilter(), inputDebounce);
  }

  function getExternalFilter() {
    return useInput ? onFilter : undefined;
  }
  // #endregion: --- Functions

  // q-field here, q-select in classes
  Q.classes("q-field", {
    bemClasses: {
      default: !outlined && !rounded && !filled,
      outlined,
      rounded,
      filled,
      "has-border": outlined || rounded,
      dense,
      active: isActive,
      focus: isFocused,
      label,
      "snippet-append": !!append,
      "snippet-prepend": !!prepend,
      disabled,
      error,
      "bottom-space": hint || (error && errorMessage),
      "use-input": useInput,
    },
    classes: [props.class, "q-select"],
  });
</script>

<div {...props} class="q-field" style:--snippet-prepend-width="{snippetPrependWidth}px" data-quaff>
  {#if before}
    <div class="q-field__snippet-before">
      {@render before()}
    </div>
  {/if}

  <div class="q-field__inner">
    <label bind:this={menuTarget} class="q-field__wrapper">
      {#if prepend}
        <div class="q-field__snippet-prepend" bind:clientWidth={snippetPrependWidth}>
          {@render prepend()}
        </div>
      {/if}

      <input
        class="q-field__input"
        value={inputValue}
        placeholder=""
        role="combobox"
        aria-autocomplete={useInput ? "list" : "none"}
        aria-controls={listboxId}
        aria-expanded={isMenuOpen}
        aria-haspopup="listbox"
        aria-label={label}
        aria-activedescendant={activeOptionId}
        aria-readonly={useInput ? undefined : "true"}
        onfocus={handleFocus}
        onblur={handleBlur}
        oninput={handleInput}
        onmousedown={handleMousedown}
        onkeydown={handleKeydown}
        {disabled}
        tabindex={disabled === true ? -1 : 0}
        readonly={!useInput}
      />

      <span class="q-field__label"><span class="q-field__label-text">{label}</span></span>

      <div class="q-field__snippet-append">
        {@render append?.()}

        <QIcon
          class="q-select__arrow-toggle {append ? 'q-select__arrow-toggle--has-append' : ''}"
          name={`arrow_drop_${isMenuOpen ? "up" : "down"}`}
          onmousedown={handleMousedown}
        />
      </div>
    </label>

    <QMenu
      bind:value={isMenuOpen}
      target={menuTarget}
      fit
      autoClose={!multiple}
      class="q-select__menu"
      id={listboxId}
      role="listbox"
      aria-multiselectable={multiple ? "true" : undefined}
    >
      <QList dense>
        {#each visibleOptions as option, idx (idx)}
          <QItem
            clickable
            active={isOptionSelectedByIndex[idx]}
            activeClass="q-select__option--selected"
            class="q-select__option {focusedOptionIndex === idx ? 'q-select__option--focused' : ''}"
            id={getOptionId(idx)}
            role="option"
            tabindex={-1}
            aria-selected={isOptionSelectedByIndex[idx] ? "true" : "false"}
            onmousedown={handleOptionMousedown}
            onmousemove={() => (focusedOptionIndex = idx)}
            onclick={(e) => handleOptionClick(e, option, idx)}
          >
            <QItemSection>{getOptionLabel(option, options)}</QItemSection>
          </QItem>
        {:else}
          <div class="q-select__no-option">{noOptionText}</div>
        {/each}
      </QList>
    </QMenu>

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
