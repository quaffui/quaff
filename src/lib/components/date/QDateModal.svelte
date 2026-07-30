<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QInput from "$components/input/QInput.svelte";
  import type { QEvent } from "$utils";
  import QDateCalendar from "./QDateCalendar.svelte";
  import { getOptionTarget } from "./calendar";
  import type { QDateFocus } from "./dateFocus";
  import type QDateState from "./dateState.svelte";

  type QDateInputEvent<T extends Event> = QEvent<T, HTMLInputElement>;
  type QDateButtonEvent = QEvent<KeyboardEvent, HTMLButtonElement>;

  let {
    state,
    focus,
    focusId,
    fullscreen,
    title,
    showModeToggle,
    confirmLabel,
    cancelLabel,
    saveLabel,
    dialogTitleId,
    cancel,
  }: {
    state: QDateState;
    focus: QDateFocus;
    focusId: string;
    fullscreen: boolean;
    title: string;
    showModeToggle: boolean;
    confirmLabel: string;
    cancelLabel: string;
    saveLabel: string;
    dialogTitleId: string;
    cancel: () => void;
  } = $props();

  const yearSelectionId = $derived(`${focusId}-years`);

  function toggleYearView() {
    const view = state.toggleCalendarView("years");

    if (view === "years") {
      focus.year(state.focusedYear, "center");
    } else {
      focus.navigation();
    }
  }

  function chooseYear(year: number) {
    state.chooseYear(year);
    focus.calendar();
  }

  function handleYearKeydown(event: QDateButtonEvent, year: number) {
    const targetYear = getOptionTarget(state.selectableYears, year, event.key, 3, state.isRtl);

    if (targetYear === undefined) {
      return;
    }

    event.preventDefault();
    state.focusedYear = targetYear;
    focus.year(targetYear);
  }

  function toggleDisplayMode() {
    const mode = state.toggleDisplayMode();

    if (mode === "input") {
      focus.inputMode();
    } else {
      focus.calendar();
    }
  }

  function handleDateInput(event: QDateInputEvent<Event>) {
    state.updateDraftInput(event.currentTarget.value);
  }

  function handleDateInputKeydown(event: QDateInputEvent<KeyboardEvent>) {
    if (event.key === "Enter") {
      event.preventDefault();
      state.submitDraftInput();
    }
  }

  // eslint-disable-next-line no-unassigned-vars -- Q.classes injects this inside the keyed loop.
  let year!: number;

  Q.classes("q-date__dropdown-icon", {
    bemClasses: {
      expanded: state.calendarView === "years",
    },
  });

  Q.classes("q-date__year", {
    bemClasses: {
      selected: year === state.displayedMonth.year,
      current: year === state.today.year,
    },
  });

  Q.classes("q-date__picker", {
    bemClasses: {
      fullscreen,
      "motion-ready": state.animatePickerChanges,
      input: state.displayMode === "input",
      auto: !state.showActions,
    },
  });
</script>

{#snippet modalCalendar()}
  <div class="q-date__month-navigation">
    <QBtn
      class="q-date__month-year"
      flat
      type="button"
      aria-expanded={state.calendarView === "years"}
      aria-controls={yearSelectionId}
      aria-label={`${state.resolvedLabels.selectYear}, ${state.monthYearLabel}`}
      title={`${state.resolvedLabels.selectMonth} / ${state.resolvedLabels.selectYear}`}
      onclick={toggleYearView}
    >
      {state.monthYearLabel}
      <QIcon class="q-date__dropdown-icon" name="arrow_drop_down" size="1.125rem" />
    </QBtn>

    {#if state.calendarView === "calendar"}
      <div class="q-date__month-actions">
        <QIconBtn
          class="q-date__navigation-arrow"
          icon="chevron_left"
          flat
          size="lg"
          type="button"
          aria-label={state.resolvedLabels.previousMonth}
          disabled={!state.canNavigatePrevious}
          onclick={() => state.changeMonth(-1)}
        />
        <QIconBtn
          class="q-date__navigation-arrow"
          icon="chevron_right"
          flat
          size="lg"
          type="button"
          aria-label={state.resolvedLabels.nextMonth}
          disabled={!state.canNavigateNext}
          onclick={() => state.changeMonth(1)}
        />
      </div>
    {/if}
  </div>

  <div class="q-date__modal-calendar-body">
    <QDateCalendar {state} {focus} docked={false} inactive={state.calendarView === "years"} />

    {#if state.calendarView === "years"}
      <div
        class="q-date__years"
        id={yearSelectionId}
        role="listbox"
        aria-label={state.resolvedLabels.yearSelection}
        transition:slide={{
          duration: state.pickerMotionDuration(300),
          axis: "y",
        }}
      >
        {#each state.selectableYears as year (year)}
          <button
            class="q-date__year"
            type="button"
            role="option"
            aria-selected={year === state.displayedMonth.year}
            tabindex={year === state.focusedYear ? 0 : -1}
            data-year={year}
            onclick={() => chooseYear(year)}
            onkeydown={(event) => handleYearKeydown(event, year)}
          >
            {state.formatters.year(year)}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<div class="q-date__picker">
  {#if fullscreen}
    <div class="q-date__app-bar">
      <QIconBtn
        class="q-date__close"
        icon="close"
        flat
        size="lg"
        type="button"
        aria-label={state.resolvedLabels.closePicker}
        onclick={cancel}
      />
      {#if state.showActions}
        <QBtn
          class="q-date__save"
          flat
          type="button"
          label={saveLabel}
          disabled={!state.canConfirm}
          onclick={() => state.commitSelection()}
        />
      {/if}
    </div>
  {/if}

  <header class="q-date__header">
    <span class="q-date__title" id={dialogTitleId}>
      {title}
    </span>
    <div class="q-date__headline" role="status" aria-live="polite" aria-atomic="true">
      {state.headline}
    </div>

    {#if showModeToggle}
      <QIconBtn
        class="q-date__mode-toggle"
        icon={state.displayMode === "calendar" ? "edit" : "calendar_month"}
        flat
        size="lg"
        type="button"
        aria-label={state.displayMode === "calendar"
          ? state.resolvedLabels.switchToInput
          : state.resolvedLabels.switchToCalendar}
        onclick={toggleDisplayMode}
      />
    {/if}
  </header>

  <div class="q-date__content">
    {#each [state.displayMode] as mode (mode)}
      <div
        class="q-date__mode-page"
        aria-hidden={mode !== state.displayMode || undefined}
        inert={mode !== state.displayMode || undefined}
        in:fly={{
          y: mode === "input" ? 48 : -48,
          duration: state.pickerMotionDuration(300),
        }}
        out:fly={{
          y: mode === "input" ? 48 : -48,
          duration: state.pickerMotionDuration(200),
        }}
      >
        {#if mode === "calendar"}
          {@render modalCalendar()}
        {:else}
          <div class="q-date__input-mode">
            <QInput
              value={state.draftInput}
              label={state.resolvedLabels.dateInput}
              mask={state.dateFieldMask}
              placeholder={state.dateInputMask}
              hint={state.inputValidationMessage
                ? undefined
                : `${state.resolvedLabels.expectedFormat}: ${state.dateInputMask}`}
              error={!!state.inputValidationMessage}
              errorMessage={state.inputValidationMessage}
              aria-invalid={!!state.inputValidationMessage || undefined}
              autocomplete="off"
              inputmode="numeric"
              outlined
              oninput={handleDateInput}
              onkeydown={handleDateInputKeydown}
              onblur={() => state.validateDraftInput()}
            />
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if !fullscreen && state.showActions}
    <footer class="q-date__actions">
      <QBtn flat type="button" label={cancelLabel} onclick={cancel} />
      <QBtn
        flat
        type="button"
        label={confirmLabel}
        disabled={!state.canConfirm}
        onclick={() => state.commitSelection()}
      />
    </footer>
  {/if}
</div>
