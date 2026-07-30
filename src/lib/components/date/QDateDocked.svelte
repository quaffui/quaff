<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import type { QEvent } from "$utils";
  import QDateCalendar from "./QDateCalendar.svelte";
  import { getOptionTarget } from "./calendar";
  import type { QDateFocus } from "./dateFocus";
  import type QDateState from "./dateState.svelte";
  import type { QDateCalendarView } from "./dateState.svelte";

  type QDateButtonEvent = QEvent<KeyboardEvent, HTMLButtonElement>;
  type SelectionKind = "month" | "year";

  let {
    state,
    focus,
    focusId,
    confirmLabel,
    cancelLabel,
    cancel,
  }: {
    state: QDateState;
    focus: QDateFocus;
    focusId: string;
    confirmLabel: string;
    cancelLabel: string;
    cancel: () => void;
  } = $props();

  function toggleCalendarView(view: Exclude<QDateCalendarView, "calendar">) {
    const nextView = state.toggleCalendarView(view);

    if (nextView === "years") {
      focus.year(state.focusedYear, "center");
    } else if (nextView === "months") {
      focus.month(state.focusedMonth, "center");
    } else {
      focus.navigation();
    }
  }

  function chooseYear(year: number) {
    state.chooseYear(year);
    focus.calendar();
  }

  function chooseMonth(month: number) {
    const option = state.monthOptions[month];

    if (option && state.chooseMonth(option.date)) {
      focus.calendar();
    }
  }

  function selectionOptions(kind: SelectionKind) {
    return kind === "month"
      ? state.monthOptions.map((option) => ({
          value: option.date.month,
          label: option.label,
          selectable: option.selectable,
          selected: option.date.month === state.displayedMonth.month,
        }))
      : state.selectableYears.map((year) => ({
          value: year,
          label: state.formatters.year(year),
          selectable: true,
          selected: year === state.displayedMonth.year,
        }));
  }

  function handleListKeydown(
    event: QDateButtonEvent,
    values: number[],
    current: number,
    kind: SelectionKind
  ) {
    const target = getOptionTarget(values, current, event.key);

    if (target === undefined) {
      return;
    }

    event.preventDefault();

    if (kind === "year") {
      state.focusedYear = target;
      focus.year(target);
    } else {
      state.focusedMonth = target;
      focus.month(target);
    }
  }

  // eslint-disable-next-line no-unassigned-vars -- Q.classes injects this inside the keyed loop.
  let option!: ReturnType<typeof selectionOptions>[number];

  Q.classes("q-date__selection-option", {
    bemClasses: {
      selected: option.selected,
    },
  });

  Q.classes("q-date__picker", {
    bemClasses: {
      docked: true,
      selection: state.calendarView !== "calendar",
      auto: !state.showActions,
    },
  });

  Q.classes("q-date__docked-navigation", {
    bemClasses: {
      selection: state.calendarView !== "calendar",
    },
  });
</script>

{#snippet selectionList(kind: SelectionKind)}
  {@const options = selectionOptions(kind)}
  {@const values = options.filter((option) => option.selectable).map((option) => option.value)}
  <div
    class="q-date__selection-list"
    id={`${focusId}-${kind}s`}
    role="listbox"
    aria-label={kind === "month"
      ? state.resolvedLabels.monthSelection
      : state.resolvedLabels.yearSelection}
  >
    {#each options as option (option.value)}
      <button
        class="q-date__selection-option"
        type="button"
        role="option"
        aria-selected={option.selected}
        disabled={!option.selectable}
        tabindex={option.value === (kind === "month" ? state.focusedMonth : state.focusedYear)
          ? 0
          : -1}
        data-month={kind === "month" ? option.value : undefined}
        data-year={kind === "year" ? option.value : undefined}
        onclick={() => (kind === "month" ? chooseMonth(option.value) : chooseYear(option.value))}
        onkeydown={(event) => handleListKeydown(event, values, option.value, kind)}
      >
        <span class="q-date__selection-check">
          {#if option.selected}
            <QIcon name="check" aria-hidden="true" />
          {/if}
        </span>
        <span>{option.label}</span>
      </button>
    {/each}
  </div>
{/snippet}

{#snippet arrow(
  icon: "chevron_left" | "chevron_right",
  label: string,
  disabled: boolean,
  action: () => void
)}
  <QIconBtn
    class="q-date__navigation-arrow"
    {icon}
    flat
    size="lg"
    type="button"
    aria-label={label}
    {disabled}
    onclick={action}
  />
{/snippet}

{#snippet selector(kind: SelectionKind)}
  {@const months = kind === "month"}
  {@const active = state.calendarView === `${kind}s`}
  <QBtn
    class={[`q-date__${kind}-select`, active && "q-date__selector--active"]}
    flat
    type="button"
    aria-expanded={active}
    aria-controls={`${focusId}-${kind}s`}
    aria-label={`${months ? state.resolvedLabels.selectMonth : state.resolvedLabels.selectYear}, ${
      months
        ? state.formatters.month(state.displayedMonth, "long")
        : state.formatters.year(state.displayedMonth.year)
    }`}
    title={months ? state.resolvedLabels.selectMonth : state.resolvedLabels.selectYear}
    disabled={state.calendarView === (months ? "years" : "months")}
    onclick={() => toggleCalendarView(months ? "months" : "years")}
  >
    <span>{months ? state.monthLabel : state.formatters.year(state.displayedMonth.year)}</span>
    {#if state.calendarView !== (months ? "years" : "months")}
      <QIcon class="q-date__dropdown-icon" name="arrow_drop_down" size="1.125rem" />
    {/if}
  </QBtn>
{/snippet}

<div class="q-date__picker">
  <div class="q-date__docked-navigation">
    {#if state.calendarView === "calendar"}
      {@render arrow(
        "chevron_left",
        state.resolvedLabels.previousMonth,
        !state.canNavigatePrevious,
        () => state.changeMonth(-1)
      )}
    {/if}
    {@render selector("month")}
    {#if state.calendarView === "calendar"}
      {@render arrow("chevron_right", state.resolvedLabels.nextMonth, !state.canNavigateNext, () =>
        state.changeMonth(1)
      )}
      {@render arrow(
        "chevron_left",
        state.resolvedLabels.previousYear,
        !state.canNavigatePreviousYear,
        () => state.changeYear(-1)
      )}
    {/if}
    {@render selector("year")}
    {#if state.calendarView === "calendar"}
      {@render arrow(
        "chevron_right",
        state.resolvedLabels.nextYear,
        !state.canNavigateNextYear,
        () => state.changeYear(1)
      )}
    {/if}
  </div>

  <div class="q-date__docked-body">
    {#if state.calendarView === "months"}
      {@render selectionList("month")}
    {:else if state.calendarView === "years"}
      {@render selectionList("year")}
    {:else}
      <QDateCalendar {state} {focus} docked />
    {/if}
  </div>

  {#if state.calendarView === "calendar" && state.showActions}
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
