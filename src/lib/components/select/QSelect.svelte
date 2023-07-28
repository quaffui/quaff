<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { createClasses } from "$lib/utils/props";
  import { textWidth } from "$lib/utils/fields";
  import { browser } from "$app/environment";
  import type { QSelectOption, QSelectProps } from "./props";

  export let options: QSelectProps["options"],
    multiple: QSelectProps["multiple"] = false,
    bordered: QSelectProps["bordered"] = false,
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

  let active = false;

  $: active = value?.length > 0;

  $: hasBorder = bordered || rounded || outlined;

  $: classes = createClasses(
    [
      "q-select",
      label && "label",
      active && "active",
      dense && "dense",
      $$slots.prepend && "prepend",
      $$slots.append && "append",
      hasBorder && "has-border",
      rounded && "rounded",
      filled && "filled",
      error && "error",
      disable && "disabled",
    ],
    {
      component: "q-select",
      userClasses,
    }
  );

  let wrapper: HTMLElement | null = null;
  let inputElement: HTMLInputElement | null = null;
  let isMenuOpen = false;
  let wasClicked = false;
  let preventClose = false;

  $: value && updateInput(inputElement as HTMLInputElement);

  function updateInput(target: HTMLInputElement) {
    const input = target;

    if (!wrapper || !input) {
      return;
    }

    const label = wrapper.querySelector("label") as HTMLLabelElement;
    const isBorder = hasBorder && !filled;

    if (active) {
      if (isBorder && label) {
        const labelWidth = textWidth(label, "0.75rem Arial");
        let width = active ? labelWidth : Math.round(labelWidth / 1.33);
        width = width / 16;
        const start = rounded ? 1.25 : 0.75;
        const end = width + start + 0.5;
        input.style.clipPath = `polygon(0% 0%, ${start}rem 0%, ${start}rem 0.5rem, ${end}rem 0.5rem, ${end}rem 0%, 100% 0%, 100% 100%, 0% 100%)`;
      } else input.style.clipPath = "";
    } else {
      input.style.clipPath = "";
    }
  }

  function handleMousedown() {
    isMenuOpen = !isMenuOpen;
    wasClicked = true;
  }

  function handleFocus(target: HTMLInputElement) {
    if (!wasClicked) {
      isMenuOpen = true;
    }

    wasClicked = false;

    updateInput(target);
  }

  function handleBlur(target: HTMLInputElement) {
    if (!multiple && !preventClose) {
      isMenuOpen = false;
    }
    preventClose = false;

    updateInput(target);
  }

  let selectedOptions: boolean[] = [];

  $: selectedOptions = options.map((option) => isSelected(option), value);

  function isSelected(option: QSelectOption) {
    const optionValue = typeof option === "string" ? option : option.value;
    return multiple ? value.includes(optionValue) : value === optionValue;
  }

  function select(evt: MouseEvent, option: QSelectOption) {
    evt.preventDefault();
    const optionValue = typeof option === "string" ? option : option.value;

    if (multiple) {
      const hasItem = (value as string[]).some((entry) => entry === optionValue);

      if (hasItem) {
        (value as string[]) = (value as string[]).filter((val) => val !== optionValue);
      } else {
        (value as string[]) = [...value, optionValue];
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

<div bind:this={wrapper} class={classes} {...$$restProps}>
  <slot name="prepend" />

  <input
    type="text"
    on:focus={(e) => handleFocus(e.currentTarget)}
    on:blur={(e) => handleBlur(e.currentTarget)}
    on:mousedown={() => handleMousedown()}
    bind:value
    bind:this={inputElement}
    tabindex={disable === true ? -1 : 0}
    readonly
    disabled={disable}
  />

  <i class="q-select__arrow-toggle" class:q-select__arrow-toggle--has-append={$$slots.append}
    >{`arrow_drop_${isMenuOpen ? "up" : "down"}`}</i
  >

  <slot name="append" />

  <div class="q-select__menu {isMenuOpen ? 'q-select__menu--active' : ''}">
    {#each options as option, idx}
      <a
        href={multiple ? "javascript:void(0)" : undefined}
        class="q-select__option {selectedOptions[idx] ? 'q-select__option--selected' : ''}"
        on:mousedown={() => (preventClose = true)}
        on:click={(e) => select(e, option)}>{typeof option === "string" ? option : option.value}</a
      >
    {/each}
  </div>

  {#if label}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="q-select__label {active ? 'q-select__label--active' : ''}">{label}</label>
  {/if}

  {#if hint}
    <span class="q-select__helper">{hint}</span>
  {:else if error && errorMessage}
    <span class="q-select__error">{errorMessage}</span>
  {/if}
</div>
