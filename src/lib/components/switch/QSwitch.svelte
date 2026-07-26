<script lang="ts">
  import { ripple } from "$helpers";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import type { QSwitchProps } from "./props";

  type QSwitchEvent<T extends Event> = QEvent<T, HTMLDivElement>;

  // #region:    --- Props
  let {
    value = $bindable(),
    label,
    labelPosition = "right",
    disabled = false,
    icons = false,
    showOnlyCheckedIcon = false,
    checkedIcon,
    uncheckedIcon,
    ...props
  }: QSwitchProps = $props();
  // #endregion: --- Props

  // #region:    --- Non-reactive variables
  const id = $props.id();
  const labelId = `q-switch__label-${id}`;

  let qSwitch: HTMLDivElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Methods
  export function toggle() {
    value = !value;
    qSwitch.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    qSwitch.dispatchEvent(new Event("change", { bubbles: true }));
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function onclick(event: QSwitchEvent<MouseEvent>) {
    if (disabled) {
      return;
    }

    props.onclick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    qSwitch.focus();
    toggle();
  }

  function onkeydown(event: QSwitchEvent<KeyboardEvent>) {
    if (disabled) {
      return;
    }

    props.onkeydown?.(event);

    if (event.defaultPrevented || !isActivationKey(event)) {
      return;
    }

    event.preventDefault();

    if (event.repeat) {
      return;
    }

    event.currentTarget.click();
  }
  // #endregion: --- Functions

  Q.classes("q-switch", {
    bemClasses: {
      disabled,
      reversed: labelPosition === "left",
    },
    classes: [props.class],
  });

  Q.classes("q-switch__handle", {
    bemClasses: {
      "with-icon": !showOnlyCheckedIcon && (icons || uncheckedIcon),
    },
  });
</script>

<div
  bind:this={qSwitch}
  {@attach ripple({ center: true, disabled })}
  {...props}
  class="q-switch"
  {onclick}
  {onkeydown}
  tabindex={disabled ? undefined : (props.tabindex ?? 0)}
  aria-disabled={disabled || undefined}
  role="switch"
  aria-checked={!!value}
  aria-labelledby={props["aria-labelledby"] ??
    (!props["aria-label"] && label ? labelId : undefined)}
  data-quaff
>
  <span class="q-switch__inner" aria-hidden="true">
    <input bind:checked={value} type="checkbox" hidden {disabled} />
    <span class="q-switch__track">
      <span class="q-switch__handle-container">
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
  </span>
  {#if label}
    <span id={labelId} class="q-switch__label">
      {label}
    </span>
  {/if}
</div>

{#snippet icon(type: "unchecked" | "checked")}
  <span class="q-switch__icon q-switch__icon--{type}">
    <QIconSnippet
      icon={type === "unchecked" ? uncheckedIcon : checkedIcon}
      defaultIcon={type === "unchecked" ? "close" : "check"}
      size="1rem"
    />
  </span>
{/snippet}
