<script lang="ts">
  import { ripple } from "$helpers";
  import { QIconSnippet } from "$private";
  import { isActivationKey, type QEvent } from "$utils";
  import type { QSwitchProps } from "./props";

  type QSwitchEvent<T> = QEvent<T, HTMLDivElement>;

  let {
    value = $bindable(),
    label = undefined,
    labelPosition = "right",
    disabled = false,
    icons = false,
    showOnlyCheckedIcon = false,
    checkedIcon,
    uncheckedIcon,
    ...props
  }: QSwitchProps = $props();

  let qSwitch: HTMLDivElement;
  let qSwitchInput: HTMLInputElement;

  function toggle() {
    value = !value;

    qSwitch.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function onclick(event: QSwitchEvent<MouseEvent>) {
    event.preventDefault();
    if (!qSwitchInput || disabled) {
      return;
    }

    props.onclick?.(event);

    qSwitchInput.focus();
    toggle();
  }

  function onkeydown(event: QSwitchEvent<KeyboardEvent>) {
    if (!qSwitch || disabled || !isActivationKey(event)) {
      return;
    }

    props.onkeydown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    qSwitch.click();
  }

  Q.classes("q-switch", {
    bemClasses: {
      disabled,
      reversed: labelPosition === "left",
    },
    classes: [props.class],
  });

  Q.classes("q-switch__handle", {
    bemClasses: {
      "with-icon": showOnlyCheckedIcon ? !!value : icons || uncheckedIcon,
    },
  });
</script>

<div
  bind:this={qSwitch}
  {...props}
  class="q-switch"
  {onclick}
  {onkeydown}
  aria-disabled={disabled || undefined}
  role="switch"
  aria-checked={value || undefined}
  data-quaff
>
  <label class="q-switch__inner">
    <input
      bind:checked={value}
      bind:this={qSwitchInput}
      type="checkbox"
      disabled={disabled || undefined}
    />
    <span class="q-switch__track">
      <span class="q-switch__touch"></span>
      <span class="q-switch__handle-container" use:ripple={{ disabled }}>
        <span class="q-switch__handle">
          {#if (uncheckedIcon || icons) && !showOnlyCheckedIcon}
            {@render icon("unchecked")}
          {/if}
          {#if checkedIcon || icons || showOnlyCheckedIcon}
            {@render icon("checked")}
          {/if}
        </span>
      </span>
    </span>
  </label>
  {#if label}
    <span class="q-switch__label">
      {label}
    </span>
  {/if}
</div>

{#snippet icon(type: "unchecked" | "checked")}
  <QIconSnippet
    icon={type === "unchecked" ? uncheckedIcon : checkedIcon}
    defaultIcon={type === "unchecked" ? "close" : "check"}
    size="1rem"
    class="q-switch__icon q-switch__icon--{type}"
  />
{/snippet}
