<script lang="ts">
  import { stringifyClasses } from "$lib/utils/props";
  import { type QInputProps } from "./props";

  export let bordered: QInputProps["bordered"] = false,
    disabled: QInputProps["disabled"] = false,
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

  $: classes = stringifyClasses([
    "q-input",
    "field",
    label && "label",
    active && "active",
    $$slots.prepend && "prefix",
    $$slots.append && "suffix",
    hasBorder && "border",
    rounded && "round",
    filled && "fill",
    error && "invalid",
    disabled && "disabled",
    userClasses,
  ]);

  let wrapper: HTMLElement | null = null;
  let inputElement: HTMLInputElement | null = null;

  $: value && updateInput(inputElement as HTMLInputElement);

  // originally from beercss
  function textWidth(element: HTMLElement, font: string): number {
    if (element.offsetWidth > 0) return element.offsetWidth;
    let _canvas = (
      document.querySelector("canvas[data-quaff]") as HTMLCanvasElement | null
    )?.getContext("2d");

    if (!_canvas) {
      const canvasElement = document.createElement("canvas");
      canvasElement.style.display = "none";
      canvasElement.setAttribute("data-quaff", "");
      document.body.append(canvasElement);
      _canvas = canvasElement.getContext("2d");
    }

    _canvas!.font = font;
    return _canvas!.measureText(element.textContent!).width;
  }

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
  />

  <slot name="append" />

  {#if label}
    <label class={active ? "active" : ""}>{label}</label>
  {/if}
  {#if hint}
    <span class="helper">{hint}</span>
  {:else if error && errorMessage}
    <span class="error">{errorMessage}</span>
  {/if}
</div>
