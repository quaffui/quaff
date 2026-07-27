<script lang="ts">
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QInput from "$components/input/QInput.svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import type { QDateFocus } from "./dateFocus";
  import type QDateState from "./dateState.svelte";
  import type { QDateInputProps } from "./props";

  type InputEvent<T extends Event> = QEvent<T, HTMLInputElement>;
  type ButtonEvent = QEvent<MouseEvent, HTMLButtonElement>;

  let {
    fieldProps,
    picker,
    focus,
    composed,
    open,
    inputId,
    triggerButtonId,
    overlayId,
    disabled,
    inactive,
    toggle,
  }: {
    fieldProps: QDateInputProps;
    picker: QDateState;
    focus: QDateFocus;
    composed: boolean;
    open: boolean;
    inputId: string;
    triggerButtonId: string;
    overlayId: string;
    disabled: boolean;
    inactive: boolean;
    toggle: () => void;
  } = $props();

  const ariaLabel = $derived(fieldProps["aria-label"] ?? fieldProps.label ?? picker.triggerLabel);

  function handleInputClick(event: InputEvent<MouseEvent>) {
    focus.remember(event.currentTarget);
    toggle();
  }

  function handleInputKeydown(event: InputEvent<KeyboardEvent>) {
    if (isActivationKey(event) || event.key === "ArrowDown") {
      event.preventDefault();
      focus.remember(event.currentTarget);
      toggle();
    }
  }

  function handleButtonClick(event: ButtonEvent) {
    event.preventDefault();
    event.stopPropagation();
    focus.remember(event.currentTarget);
    toggle();
  }

  Q.classes("q-date__trigger", {
    bemClasses: { open },
    classes: [fieldProps.class],
  });
</script>

{#snippet calendarIcon()}
  <QIconBtn
    class="q-date__field-icon"
    icon="calendar_month"
    flat
    type="button"
    tabindex={-1}
    aria-label={picker.triggerLabel}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-controls={overlayId}
    disabled={inactive}
    onclick={handleButtonClick}
  />
{/snippet}

{#if composed}
  <span class="q-date__trigger" style={fieldProps.style}>
    <QIconBtn
      class="q-date__trigger-button"
      id={triggerButtonId}
      icon="calendar_month"
      flat
      size="lg"
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={overlayId}
      disabled={inactive}
      onclick={handleButtonClick}
    />
  </span>
{:else}
  <QInput
    {...fieldProps}
    class={["q-date", fieldProps.class]}
    value={picker.fieldDisplayValue}
    id={inputId}
    append={calendarIcon}
    role="combobox"
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-controls={overlayId}
    aria-label={ariaLabel}
    aria-readonly="true"
    onclick={handleInputClick}
    onkeydown={handleInputKeydown}
    {disabled}
    readonly
    inputmode="none"
    tabindex={disabled ? -1 : (fieldProps.tabindex ?? 0)}
  />
{/if}
