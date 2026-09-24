<!--
@component
QTime is a Material 3 component for selecting or entering a time. It supports dial and text-input modes, modal, docked, and adaptive presentations, 12- and 24-hour clocks, localization, validation, and composition with QInput.
-->

<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";
  import { useI18n } from "$internal/i18n.svelte";
  import Quaff from "$classes/Quaff.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QDialog from "$components/dialog/QDialog.svelte";
  import QInput from "$components/input/QInput.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import { isActivationKey, type QEvent } from "$utils";
  import createTimeFocus from "./timeFocus";
  import QTimePicker from "./QTimePicker.svelte";
  import QTimeState, { type QTimeStateSource } from "./timeState.svelte";
  import type { QTimeDialMeasurement } from "./timeFit";
  import type { QTimeProps, QTimeValue } from "./props";

  type InputEvent<T extends Event> = QEvent<T, HTMLInputElement>;
  type ButtonEvent = QEvent<MouseEvent, HTMLButtonElement>;

  // Choose the baseline orientation, then measure the rendered dial for available space.
  const HORIZONTAL_PICKER_MIN_WIDTH = 588;
  const VIEWPORT_MARGIN = 8;
  const AUTO_APPLY_CLOSE_DELAY = 400;

  const i18n = useI18n("time");
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
    locale: providedLocale,
    format24h,
    defaultMode = "dial",
    showModeToggle = true,
    autoApply = false,
    readonly = false,
    disabled = false,
    title: providedTitle,
    inputTitle: providedInputTitle,
    confirmLabel: providedConfirmLabel,
    cancelLabel: providedCancelLabel,
    labels,
    id: providedInputId,
    ...fieldProps
  }: QTimeProps = $props();

  let wasOpen = false;
  let dialMeasurement = $state<QTimeDialMeasurement | null>(null);
  let pendingClose: ReturnType<typeof setTimeout> | undefined;

  const locale = $derived(providedLocale ?? i18n.locale);
  const title = $derived(providedTitle ?? i18n.labels.title);
  const inputTitle = $derived(providedInputTitle ?? i18n.labels.inputTitle);
  const confirmLabel = $derived(providedConfirmLabel ?? i18n.labels.confirmLabel);
  const cancelLabel = $derived(providedCancelLabel ?? i18n.labels.cancelLabel);
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
  const isHorizontalLayout = $derived(
    !docked && landscape && viewportWidth >= HORIZONTAL_PICKER_MIN_WIDTH
  );
  const dialUnavailable = $derived(
    dialMeasurement !== null &&
      dialMeasurement.isHorizontal === isHorizontalLayout &&
      (!dialMeasurement.doesContentFit ||
        dialMeasurement.width > viewportWidth - VIEWPORT_MARGIN * 2 ||
        dialMeasurement.height > viewportHeight - VIEWPORT_MARGIN * 2)
  );
  const source: QTimeStateSource = {
    value: () => value,
    locale: () => locale,
    format24h: () => format24h,
    labels: () => ({ ...i18n.labels, ...labels }),
    defaultMode: () => defaultMode,
    autoApply: () => autoApply,
    commit,
  };
  const picker = new QTimeState(source);
  const horizontal = $derived(picker.displayMode === "dial" && isHorizontalLayout);
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
      dialMeasurement = null;
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

  /** Opens the time picker when the field is interactive. */
  export function show() {
    if (!disabled && !readonly) {
      clearPendingClose();
      open = true;
    }
  }

  /** Closes the time picker without committing its draft selection. */
  export function hide() {
    clearPendingClose();
    open = false;
  }

  /** Toggles the time picker overlay. */
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
    }, AUTO_APPLY_CLOSE_DELAY);
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
    expressive={composed ? false : undefined}
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
      {open}
      onDialMeasure={(measurement) => (dialMeasurement = measurement)}
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
      {open}
      onDialMeasure={(measurement) => (dialMeasurement = measurement)}
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
