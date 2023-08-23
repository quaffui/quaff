<script lang="ts">
  import { createClasses, textWidth } from "$lib/utils";
  import type { QInputProps } from "./props";

  export let bordered: QInputProps["bordered"] = false,
    dense: QInputProps["dense"] = false,
    disable: QInputProps["disable"] = false,
    error: QInputProps["error"] = false,
    errorMessage: QInputProps["errorMessage"] = undefined,
    filled: QInputProps["filled"] = false,
    hint: QInputProps["hint"] = undefined,
    label: QInputProps["label"] = undefined,
    outlined: QInputProps["outlined"] = false,
    rounded: QInputProps["rounded"] = false,
    value: QInputProps["value"],
    userClasses: QInputProps["userClasses"] = undefined;
  export { userClasses as class };

  let active = false;

  $: hasBorder = bordered || rounded || outlined;

  $: classes = createClasses(
    [
      label && "label",
      active && "active",
      dense && "dense",
      $$slots.prepend && "prepend",
      $$slots.append && "append",
      hasBorder && "has-border",
      bordered && "bordered",
      rounded && "rounded",
      filled && "filled",
      error && "error",
      disable && "disabled",
    ],
    {
      component: "q-input",
      userClasses,
    }
  );

  let wrapper: HTMLElement | null = null;
  let inputElement: HTMLInputElement | null = null;

  $: value && updateInput(inputElement as HTMLInputElement);

  // originally from beercss
  function updateInput(target: HTMLInputElement) {
    const input = target;

    if (!wrapper) {
      throw new Error("unexpected to not have element");
    }

    const label = wrapper.querySelector("label") as HTMLLabelElement;
    const isBorder = hasBorder && !filled;
    const toActive =
      document.activeElement === target || input.value || input.querySelector("[selected]");

    if (toActive) {
      if (isBorder && label) {
        const labelWidth = textWidth(label, "0.75rem Arial");
        let width = active ? labelWidth : Math.round(labelWidth / 1.33);
        width = width / 16;
        const start = rounded ? 1.25 : 0.75;
        const end = width + start + 0.5;
        input.style.clipPath = `polygon(0% 0%, ${start}rem 0%, ${start}rem 0.5rem, ${end}rem 0.5rem, ${end}rem 0%, 100% 0%, 100% 100%, 0% 100%)`;
      } else input.style.clipPath = "";
      active = true;
    } else {
      active = false;
      input.style.clipPath = "";
    }
  }
</script>

<div bind:this={wrapper} class={classes} {...$$restProps}>
  <slot name="prepend" />

  <input
    type="text"
    on:focus={(e) => updateInput(e.currentTarget)}
    on:blur={(e) => updateInput(e.currentTarget)}
    bind:value
    bind:this={inputElement}
    tabindex={disable === true ? -1 : 0}
  />

  <slot name="append" />

  {#if label}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="q-input__label {active ? 'q-input__label--active' : ''}">{label}</label>
  {/if}
  {#if hint}
    <span class="q-input__helper">{hint}</span>
  {:else if error && errorMessage}
    <span class="q-input__error">{errorMessage}</span>
  {/if}
</div>
