<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import Quaff from "$classes/Quaff.svelte";
  import QDialog from "$components/dialog/QDialog.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import type { QEvent } from "$utils";
  import QDateDocked from "./QDateDocked.svelte";
  import QDateModal from "./QDateModal.svelte";
  import QDateTrigger from "./QDateTrigger.svelte";
  import { defaultDateMask, isValidDateMask } from "./date";
  import createDateFocus from "./dateFocus";
  import QDateState, { type QDateStateSource } from "./dateState.svelte";
  import type { QDateProps, QDateValue } from "./props";

  type DialogEvent<T extends Event> = QEvent<T, HTMLDialogElement>;

  const componentId = $props.id();
  const generatedInputId = `q-date-input-${componentId}`;
  const triggerButtonId = `q-date-trigger-${componentId}`;
  const dialogId = `q-date-dialog-${componentId}`;
  const dockedId = `q-date-docked-${componentId}`;
  const dialogTitleId = `q-date-title-${componentId}`;

  let {
    value = $bindable<QDateValue>(),
    open = $bindable(false),
    validationMessage = $bindable(""),
    mask = defaultDateMask,
    variant = "modal",
    min,
    max,
    yearRange = [1900, 2100],
    disabledDates,
    locale = "en-US",
    firstDayOfWeek,
    defaultMode = "calendar",
    showModeToggle = true,
    autoApply = false,
    readonly = false,
    disabled = false,
    title = "Select date",
    inputTitle = "Enter date",
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    saveLabel = "Save",
    labels,
    id: providedInputId,
    ...fieldProps
  }: QDateProps = $props();

  let wasOpen = false;

  const inputId = $derived(providedInputId ?? generatedInputId);
  const modelMask = $derived(isValidDateMask(mask) ? mask : defaultDateMask);
  const composed = $derived(variant !== "modal");
  const compact = $derived(Quaff.breakpoints.isLessThan("sm"));
  const docked = $derived(variant === "docked" || (variant === "adaptive" && !compact));
  const fullscreen = $derived(!docked && compact);
  const overlayId = $derived(docked ? dockedId : dialogId);

  const source: QDateStateSource = {
    value: () => value,
    mask: () => modelMask,
    min: () => min,
    max: () => max,
    yearRange: () => yearRange,
    disabledDates: () => disabledDates,
    locale: () => locale,
    firstDayOfWeek: () => firstDayOfWeek,
    labels: () => labels,
    inputTitle: () => inputTitle,
    defaultMode: () => defaultMode,
    docked: () => docked,
    autoApply: () => autoApply,
    commit,
  };
  const picker = new QDateState(source);
  const focus = createDateFocus({
    open: () => open,
    docked: () => docked,
    overlayId: () => overlayId,
    inputId: () => inputId,
    triggerId: triggerButtonId,
    state: picker,
  });

  onDestroy(focus.destroy);

  $effect(() => {
    if (validationMessage !== picker.valueValidationMessage) {
      validationMessage = picker.valueValidationMessage;
    }
  });

  $effect.pre(() => {
    if (open === wasOpen) {
      return;
    }

    wasOpen = open;

    if (open) {
      focus.capture();
      picker.beginSession(focus.direction());
    } else {
      picker.animatePickerChanges = false;
      picker.calendarView = "calendar";
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
    const config = {
      value,
      mask: modelMask,
      min,
      max,
      yearStart: yearRange[0],
      yearEnd: yearRange[1],
      disabledDates,
      locale,
      firstDayOfWeek,
    };

    if (!open) {
      return;
    }

    const refocus = untrack(focus.isDayFocused);

    untrack(() => {
      picker.isRtl = focus.direction();
      picker.synchronizeExternalValue(config.value);
      picker.reconcileOpenSession();
    });

    if (refocus) {
      focus.calendar();
    }
  });

  $effect(() => {
    if (!docked && picker.calendarView === "months") {
      untrack(() => {
        picker.calendarView = "calendar";
      });
    }
  });

  $effect(() => {
    const currentOverlayId = overlayId;

    if (!open) {
      focus.cancel();
      return;
    }

    picker.animatePickerChanges = false;
    focus.scheduleCurrent(currentOverlayId);
    return focus.cancel;
  });

  export function show() {
    if (!disabled && !readonly) {
      open = true;
    }
  }

  export function hide() {
    open = false;
  }

  export function toggle() {
    open ? hide() : show();
  }

  function commit(nextValue: string) {
    value = nextValue;
    open = false;
  }

  function handleDialogClick(event: DialogEvent<MouseEvent>) {
    if (event.target === event.currentTarget) {
      hide();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && picker.calendarView !== "calendar") {
      event.preventDefault();
      event.stopPropagation();
      picker.calendarView = "calendar";
      focus.navigation();
    }
  }
</script>

<QDateTrigger
  {fieldProps}
  {picker}
  {focus}
  {composed}
  {open}
  {inputId}
  {triggerButtonId}
  {overlayId}
  {disabled}
  inactive={disabled || readonly}
  {toggle}
/>

{#if docked}
  <QMenu
    bind:value={open}
    anchor={picker.isRtl ? "bottom right" : "bottom left"}
    self={picker.isRtl ? "top right" : "top left"}
    autoClose={false}
    class="q-date__docked"
    id={dockedId}
    role="dialog"
    dir={picker.isRtl ? "rtl" : "ltr"}
    aria-label={title}
    onkeydown={handleOverlayKeydown}
  >
    <QDateDocked
      state={picker}
      {focus}
      focusId={dockedId}
      {confirmLabel}
      {cancelLabel}
      cancel={hide}
    />
  </QMenu>
{:else}
  <QDialog
    bind:value={open}
    class="q-date__dialog"
    id={dialogId}
    modal
    {fullscreen}
    dir={picker.isRtl ? "rtl" : "ltr"}
    aria-labelledby={dialogTitleId}
    onclick={handleDialogClick}
    onkeydown={handleOverlayKeydown}
  >
    <QDateModal
      state={picker}
      {focus}
      focusId={dialogId}
      {fullscreen}
      {title}
      {showModeToggle}
      {confirmLabel}
      {cancelLabel}
      {saveLabel}
      {dialogTitleId}
      cancel={hide}
    />
  </QDialog>
{/if}
