<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import type { QEvent } from "$utils";
  import QTimeDial from "./QTimeDial.svelte";
  import type { QTimeFocus } from "./timeFocus";
  import type QTimeState from "./timeState.svelte";
  import type { QTimeActivePart } from "./timeState.svelte";
  import type { QTimePeriod } from "./props";

  type TimeInputEvent<T extends Event> = QEvent<T, HTMLInputElement>;
  type PeriodButtonEvent = QEvent<KeyboardEvent, HTMLButtonElement>;
  const periods: readonly QTimePeriod[] = ["am", "pm"];

  let {
    state,
    focus,
    docked,
    horizontal,
    showModeToggle,
    title,
    inputTitle,
    confirmLabel,
    cancelLabel,
    titleId,
    cancel,
  }: {
    state: QTimeState;
    focus: QTimeFocus;
    docked: boolean;
    horizontal: boolean;
    showModeToggle: boolean;
    title: string;
    inputTitle: string;
    confirmLabel: string;
    cancelLabel: string;
    titleId: string;
    cancel: () => void;
  } = $props();

  let previousActivePart: QTimeActivePart | undefined;

  $effect(() => {
    const activePart = state.activePart;

    if (previousActivePart === undefined) {
      previousActivePart = activePart;
      return;
    }

    if (activePart !== previousActivePart) {
      previousActivePart = activePart;

      if (state.displayMode === "dial") {
        focus.dial();
      }
    }
  });

  function selectPart(part: QTimeActivePart) {
    state.activePart = part;
    state.displayMode === "input" ? focus.input(part) : focus.dial();
  }

  function toggleDisplayMode() {
    const mode = state.toggleDisplayMode();
    mode === "input" ? focus.input("hour") : focus.dial();
  }

  function handleInput(event: TimeInputEvent<Event>, part: QTimeActivePart) {
    const input = event.currentTarget;
    const value = input.value.replaceAll(/\D/g, "").slice(0, 2);

    if (input.value !== value) {
      input.value = value;
    }

    part === "hour" ? state.updateHourInput(value) : state.updateMinuteInput(value);
  }

  function handleInputKeydown(event: TimeInputEvent<KeyboardEvent>, part: QTimeActivePart) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (part === "hour" && state.hourInputValid) {
      state.activePart = "minute";
      focus.input("minute");
    } else if (part === "minute") {
      state.submitDraftInput();
    }
  }

  function handleInputBlur(part: QTimeActivePart) {
    if (part === "hour") {
      state.hourInputTouched = true;
    } else {
      state.minuteInputTouched = true;
    }
  }

  function selectPeriod(period: QTimePeriod, target?: HTMLButtonElement | null) {
    state.selectPeriod(period);
    target?.focus();
  }

  function handlePeriodKeydown(event: PeriodButtonEvent, period: QTimePeriod) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextPeriod: QTimePeriod = period === "am" ? "pm" : "am";
    const next = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
      `[data-period="${nextPeriod}"]`
    );
    selectPeriod(nextPeriod, next);
  }

  Q.classes("q-time__picker", {
    bemClasses: {
      docked,
      horizontal,
      input: state.displayMode === "input",
      "24h": state.format24h,
    },
  });
</script>

{#snippet periodSelector()}
  {#if !state.format24h}
    <div
      class="q-time__period"
      role="radiogroup"
      aria-label={`${state.resolvedLabels.am} / ${state.resolvedLabels.pm}`}
    >
      {#each periods as period (period)}
        {@const selected = state.period === period}
        <button
          class={["q-time__period-option", selected && "q-time__period-option--selected"]}
          type="button"
          role="radio"
          aria-checked={selected}
          tabindex={selected ? 0 : -1}
          data-period={period}
          onclick={(event) => selectPeriod(period, event.currentTarget)}
          onkeydown={(event) => handlePeriodKeydown(event, period)}
        >
          {state.resolvedLabels[period]}
        </button>
      {/each}
    </div>
  {/if}
{/snippet}

{#snippet timeSelectors()}
  <div class="q-time__controls">
    <div class="q-time__time-selectors" role="radiogroup" aria-label={state.resolvedLabels.clock}>
      <button
        class={[
          "q-time__time-selector",
          state.activePart === "hour" && "q-time__time-selector--selected",
        ]}
        type="button"
        role="radio"
        aria-checked={state.activePart === "hour"}
        aria-label={`${state.resolvedLabels.selectHour}, ${state.displayHour}`}
        onclick={() => selectPart("hour")}
      >
        {state.displayHour}
      </button>
      <span class="q-time__separator" aria-hidden="true">:</span>
      <button
        class={[
          "q-time__time-selector",
          state.activePart === "minute" && "q-time__time-selector--selected",
        ]}
        type="button"
        role="radio"
        aria-checked={state.activePart === "minute"}
        aria-label={`${state.resolvedLabels.selectMinute}, ${state.displayMinute}`}
        onclick={() => selectPart("minute")}
      >
        {state.displayMinute}
      </button>
    </div>
    {@render periodSelector()}
  </div>
{/snippet}

{#snippet timeInput(part: QTimeActivePart)}
  {@const hour = part === "hour"}
  {@const invalid = hour ? state.hourInputInvalid : state.minuteInputInvalid}
  {@const label = hour ? state.resolvedLabels.hour : state.resolvedLabels.minute}
  {@const value = hour ? state.draftHourInput : state.draftMinuteInput}
  {@const inputId = `${titleId}-${part}`}
  {@const labelId = `${inputId}-label`}
  {@const errorId = `${titleId}-input-error`}
  <label
    class={[
      "q-time__input-field",
      state.activePart === part && "q-time__input-field--selected",
      invalid && "q-time__input-field--invalid",
    ]}
  >
    <input
      class="q-time__input-control"
      id={inputId}
      {value}
      aria-label={label}
      aria-describedby={invalid && state.inputValidationMessage ? errorId : undefined}
      aria-invalid={invalid || undefined}
      data-time-input={part}
      inputmode="numeric"
      maxlength="2"
      autocomplete="off"
      enterkeyhint={hour ? "next" : "done"}
      onfocus={() => (state.activePart = part)}
      oninput={(event) => handleInput(event, part)}
      onkeydown={(event) => handleInputKeydown(event, part)}
      onblur={() => handleInputBlur(part)}
    />
    <span class="q-time__input-label" id={labelId}>{label}</span>
  </label>
{/snippet}

{#snippet inputSelectors()}
  <div
    class="q-time__controls q-time__controls--input"
    role="group"
    aria-label={state.resolvedLabels.timeInput}
  >
    <div class="q-time__input-fields">
      {@render timeInput("hour")}
      <span class="q-time__separator" aria-hidden="true">:</span>
      {@render timeInput("minute")}
    </div>
    {@render periodSelector()}
    <div
      class="q-time__input-error"
      id={`${titleId}-input-error`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {state.inputValidationMessage}
    </div>
  </div>
{/snippet}

<div class="q-time__picker">
  <span class="q-time__title" id={titleId}>
    {state.displayMode === "input" ? inputTitle : title}
  </span>

  <div class="q-time__mode-page">
    <div class="q-time__main">
      {#if state.displayMode === "input"}
        {@render inputSelectors()}
      {:else}
        {@render timeSelectors()}
        <div class="q-time__content">
          <QTimeDial {state} />
        </div>
      {/if}
    </div>
  </div>

  <span class="q-time__announcement" role="status" aria-live="polite" aria-atomic="true">
    {state.spokenTime}
  </span>

  {#if showModeToggle || state.showActions}
    <footer class="q-time__footer">
      {#if showModeToggle}
        <QIconBtn
          class="q-time__mode-toggle"
          icon={state.displayMode === "dial" ? "keyboard" : "schedule"}
          flat
          type="button"
          aria-label={state.displayMode === "dial"
            ? state.resolvedLabels.switchToInput
            : state.resolvedLabels.switchToDial}
          onclick={toggleDisplayMode}
        />
      {/if}

      {#if state.showActions}
        <div class="q-time__actions">
          <QBtn flat type="button" label={cancelLabel} onclick={cancel} />
          <QBtn
            flat
            type="button"
            label={confirmLabel}
            disabled={!state.canConfirm}
            onclick={() => state.commitSelection()}
          />
        </div>
      {/if}
    </footer>
  {/if}
</div>
