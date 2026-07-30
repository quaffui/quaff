<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";
  import Quaff from "$classes/Quaff.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QDialog from "$components/dialog/QDialog.svelte";
  import QInput from "$components/input/QInput.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import createTimeFocus from "./timeFocus";
  import QTimePicker from "./QTimePicker.svelte";
  import QTimeState, { type QTimeStateSource } from "./timeState.svelte";
  import type { QTimeProps, QTimeValue } from "./props";

  type InputEvent<T extends Event> = QEvent<T, HTMLInputElement>;
  type ButtonEvent = QEvent<MouseEvent, HTMLButtonElement>;

  // These thresholds come from the measured M3 picker geometry plus an 8px viewport margin.
  const horizontalPickerMinWidth = 588;
  const horizontalPickerMinHeight = 400;
  const verticalPickerMinHeight = 536;
  const autoApplyCloseDelay = 400;

  const componentId = $props.id();
  const generatedInputId = `q-time-input-${componentId}`;
  const triggerButtonId = `q-time-trigger-${componentId}`;
  const dialogId = `q-time-dialog-${componentId}`;
  const dockedId = `q-time-docked-${componentId}`;
  const titleId = `q-time-title-${componentId}`;

  let {
    value = $bindable<QTimeValue>(),
    open = $bindable(false),
    validationMessage = $bindable(""),
    variant = "modal",
    locale = "en-US",
    format24h,
    defaultMode = "dial",
    showModeToggle = true,
    autoApply = false,
    readonly = false,
    disabled = false,
    title = "Select time",
    inputTitle = "Enter time",
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    labels,
    id: providedInputId,
    ...fieldProps
  }: QTimeProps = $props();

  let wasOpen = false;
  let pendingClose: ReturnType<typeof setTimeout> | undefined;

  const inputId = $derived(providedInputId ?? generatedInputId);
  const composed = $derived(variant !== "modal");
  const compact = $derived(Quaff.breakpoints.isLessThan("sm"));
  const docked = $derived(variant === "docked" || (variant === "adaptive" && !compact));
  const overlayId = $derived(docked ? dockedId : dialogId);
  const viewportWidth = $derived(innerWidth.current ?? 0);
  const viewportHeight = $derived(innerHeight.current ?? 0);
  const landscape = $derived(
    viewportWidth > 0 && viewportHeight > 0 && viewportHeight < viewportWidth
  );
  const canUseHorizontalDial = $derived(
    viewportWidth >= horizontalPickerMinWidth && viewportHeight >= horizontalPickerMinHeight
  );
  const dialUnavailable = $derived(
    !docked &&
      viewportHeight > 0 &&
      (landscape ? !canUseHorizontalDial : viewportHeight < verticalPickerMinHeight)
  );
  const source: QTimeStateSource = {
    value: () => value,
    locale: () => locale,
    format24h: () => format24h,
    labels: () => labels,
    defaultMode: () => defaultMode,
    docked: () => docked,
    autoApply: () => autoApply,
    commit,
  };
  const picker = new QTimeState(source);
  const horizontal = $derived(
    !docked && picker.displayMode === "dial" && landscape && canUseHorizontalDial
  );
  const focus = createTimeFocus({
    open: () => open,
    overlayId: () => overlayId,
    inputId: () => inputId,
    inputMode: () => picker.displayMode === "input",
    triggerId: triggerButtonId,
    state: picker,
  });
  const ariaLabel = $derived(fieldProps["aria-label"] ?? fieldProps.label ?? picker.triggerLabel);

  onDestroy(() => {
    clearPendingClose();
    focus.destroy();
  });

  $effect(() => {
    if (validationMessage !== picker.valueValidationMessage) {
      validationMessage = picker.valueValidationMessage;
    }
  });

  $effect.pre(() => {
    if (open === wasOpen) {
      return;
    }

    clearPendingClose();
    wasOpen = open;

    if (open) {
      focus.capture();
      picker.beginSession(focus.direction());
    } else {
      picker.animatePickerChanges = false;
      focus.restore(!docked);
    }
  });

  $effect(() => {
    if ((disabled || readonly) && open) {
      untrack(() => {
        open = false;
      });
    }
  });

  $effect(() => {
    const config = { value, locale, format24h, docked };

    if (!open) {
      return;
    }

    const refocus = untrack(focus.isDialFocused);

    untrack(() => {
      picker.isRtl = focus.direction();
      picker.synchronizeExternalValue(config.value);
      picker.reconcileOpenSession();
    });

    if (refocus) {
      focus.dial();
    }
  });

  $effect(() => {
    if (open && dialUnavailable && picker.displayMode === "dial") {
      untrack(() => {
        picker.displayMode = "input";
      });
    }
  });

  $effect(() => {
    const currentOverlayId = overlayId;
    const currentMode = picker.displayMode;
    const currentOrientation = horizontal;

    if (!open) {
      return;
    }

    void currentMode;
    void currentOrientation;
    focus.scheduleCurrent(currentOverlayId);
  });

  export function show() {
    if (!disabled && !readonly) {
      clearPendingClose();
      open = true;
    }
  }

  export function hide() {
    clearPendingClose();
    open = false;
  }

  export function toggle() {
    open ? hide() : show();
  }

  function commit(nextValue: string) {
    clearPendingClose();
    value = nextValue;

    if (!autoApply) {
      open = false;
      return;
    }

    pendingClose = setTimeout(() => {
      pendingClose = undefined;
      open = false;
    }, autoApplyCloseDelay);
  }

  function clearPendingClose() {
    if (pendingClose !== undefined) {
      clearTimeout(pendingClose);
      pendingClose = undefined;
    }
  }

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

  Q.classes("q-time__trigger", {
    bemClasses: { open },
    classes: [fieldProps.class],
  });
</script>

{#snippet clockIcon(tabindex = -1)}
  <QIconBtn
    class={composed ? "q-time__trigger-button" : "q-time__field-icon"}
    id={composed ? triggerButtonId : undefined}
    icon="schedule"
    flat
    size={composed ? "lg" : undefined}
    type="button"
    {tabindex}
    aria-label={composed ? ariaLabel : picker.triggerLabel}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-controls={overlayId}
    disabled={disabled || readonly}
    onclick={handleButtonClick}
  />
{/snippet}

{#if composed}
  <span class="q-time__trigger" style={fieldProps.style}>
    {@render clockIcon(0)}
  </span>
{:else}
  <QInput
    {...fieldProps}
    class={["q-time", fieldProps.class]}
    value={picker.fieldDisplayValue}
    id={inputId}
    append={clockIcon}
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

{#if docked}
  <QMenu
    bind:value={open}
    anchor={picker.isRtl ? "bottom right" : "bottom left"}
    self={picker.isRtl ? "top right" : "top left"}
    autoClose={false}
    class="q-time__docked"
    id={dockedId}
    role="dialog"
    dir={picker.isRtl ? "rtl" : "ltr"}
    aria-labelledby={titleId}
  >
    <QTimePicker
      state={picker}
      {focus}
      {docked}
      {horizontal}
      showModeToggle={false}
      {title}
      {inputTitle}
      {confirmLabel}
      {cancelLabel}
      {titleId}
      cancel={hide}
    />
  </QMenu>
{:else}
  <QDialog
    bind:value={open}
    class="q-time__dialog"
    id={dialogId}
    modal
    dir={picker.isRtl ? "rtl" : "ltr"}
    aria-labelledby={titleId}
  >
    <QTimePicker
      state={picker}
      {focus}
      {docked}
      {horizontal}
      showModeToggle={showModeToggle && !dialUnavailable}
      {title}
      {inputTitle}
      {confirmLabel}
      {cancelLabel}
      {titleId}
      cancel={hide}
    />
  </QDialog>
{/if}
