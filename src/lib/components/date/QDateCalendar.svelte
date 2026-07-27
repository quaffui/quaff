<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { isActivationKey, type QEvent } from "$utils";
  import {
    addCalendarDays,
    addCalendarMonths,
    compareCalendarDates,
    createUtcDate,
    isSameCalendarDate,
    type QCalendarDate,
  } from "./date";
  import type { QDateCalendarPage } from "./calendar";
  import type { QDateFocus } from "./dateFocus";
  import type QDateState from "./dateState.svelte";

  type QDateButtonEvent = QEvent<KeyboardEvent, HTMLButtonElement>;

  let {
    state,
    focus,
    docked,
    inactive = false,
  }: {
    state: QDateState;
    focus: QDateFocus;
    docked: boolean;
    inactive?: boolean;
  } = $props();

  let swipePointerId: number | undefined;
  let swipeStartX = 0;
  let swipeStartY = 0;

  function selectDate(date: QCalendarDate) {
    if (state.selectDate(date)) {
      focus.calendar();
    }
  }

  function handleDayKeydown(event: QDateButtonEvent, date: QCalendarDate) {
    if (isActivationKey(event)) {
      event.preventDefault();
      selectDate(date);
      return;
    }

    const direction = getComputedStyle(event.currentTarget).direction;
    let target: QCalendarDate | null = null;

    if (event.key === "ArrowLeft") {
      target = addCalendarDays(date, direction === "rtl" ? 1 : -1);
    } else if (event.key === "ArrowRight") {
      target = addCalendarDays(date, direction === "rtl" ? -1 : 1);
    } else if (event.key === "ArrowUp") {
      target = addCalendarDays(date, -7);
    } else if (event.key === "ArrowDown") {
      target = addCalendarDays(date, 7);
    } else if (event.key === "Home") {
      const weekOffset = (createUtcDate(date).getUTCDay() - state.resolvedFirstDayOfWeek + 7) % 7;
      target = addCalendarDays(date, -weekOffset);
    } else if (event.key === "End") {
      const weekOffset = (createUtcDate(date).getUTCDay() - state.resolvedFirstDayOfWeek + 7) % 7;
      target = addCalendarDays(date, 6 - weekOffset);
    } else if (event.key === "PageUp") {
      target = addCalendarMonths(date, event.shiftKey ? -12 : -1);
    } else if (event.key === "PageDown") {
      target = addCalendarMonths(date, event.shiftKey ? 12 : 1);
    }

    if (!target) {
      return;
    }

    event.preventDefault();
    const searchDirection = compareCalendarDates(target, date) < 0 ? -1 : 1;

    if (state.moveFocusedDate(target, searchDirection)) {
      focus.calendar();
    }
  }

  function handlePointerdown(event: PointerEvent) {
    if (!event.isPrimary || event.pointerType === "mouse" || state.calendarView !== "calendar") {
      return;
    }

    swipePointerId = event.pointerId;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  }

  function handlePointerup(event: PointerEvent) {
    if (swipePointerId !== event.pointerId) {
      return;
    }

    swipePointerId = undefined;
    const deltaX = event.clientX - swipeStartX;
    const deltaY = event.clientY - swipeStartY;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) {
      return;
    }

    event.preventDefault();
    const logicalDelta = deltaX * (state.isRtl ? -1 : 1);
    state.changeMonth(logicalDelta < 0 ? 1 : -1);
  }

  function monthSlide(_node: Element, { direction }: { direction: number }) {
    return {
      duration: state.pickerMotionDuration(300),
      easing: cubicOut,
      css: (_t: number, u: number) => `translate: ${u * direction * 100}% 0;`,
    };
  }

  // eslint-disable-next-line no-unassigned-vars -- Q.classes injects this inside the keyed loop.
  let cell!: NonNullable<QDateCalendarPage["cells"][number]>;

  Q.classes("q-date__day", {
    bemClasses: {
      outside: docked && cell.outside,
      selected: isSameCalendarDate(cell.date, state.draftDate),
      today: cell.today,
    },
  });
</script>

{#snippet calendarDays(page: QDateCalendarPage)}
  <div class="q-date__days" role="rowgroup">
    {#each Array.from({ length: 6 }) as _, rowIndex (rowIndex)}
      <div class="q-date__week" role="row">
        {#each page.cells.slice(rowIndex * 7, rowIndex * 7 + 7) as cell, columnIndex (`${rowIndex}-${columnIndex}`)}
          {#if cell}
            <button
              class="q-date__day"
              type="button"
              role="gridcell"
              aria-label={cell.label}
              aria-selected={isSameCalendarDate(cell.date, state.draftDate)}
              aria-current={cell.today ? "date" : undefined}
              aria-disabled={!cell.selectable}
              disabled={!cell.selectable}
              tabindex={cell.selectable && isSameCalendarDate(cell.date, state.focusedDate)
                ? 0
                : -1}
              data-date={cell.key}
              onclick={() => selectDate(cell.date)}
              onkeydown={(event) => handleDayKeydown(event, cell.date)}
            >
              <span>{cell.number}</span>
            </button>
          {:else}
            <span class="q-date__day q-date__day--empty" role="gridcell"></span>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
{/snippet}

<div
  class="q-date__calendar-viewport"
  role="presentation"
  onpointerdown={handlePointerdown}
  onpointerup={handlePointerup}
  onpointercancel={() => (swipePointerId = undefined)}
>
  <div class="q-date__month-announcement" aria-live="polite" aria-atomic="true">
    {state.calendarPage.label}
  </div>

  <div
    class="q-date__calendar"
    role="grid"
    aria-label={`${state.resolvedLabels.calendar}, ${state.calendarPage.label}`}
    aria-rowcount="7"
    aria-colcount="7"
    aria-hidden={inactive || undefined}
    inert={inactive || undefined}
  >
    <div class="q-date__weekdays" role="row">
      {#each state.weekdayLabels as weekday (weekday.key)}
        <div class="q-date__weekday" role="columnheader" aria-label={weekday.long}>
          {weekday.narrow}
        </div>
      {/each}
    </div>

    <div class="q-date__month-viewport" role="presentation">
      {#each [state.calendarPage] as page (page.key)}
        <div
          class="q-date__calendar-page"
          role="presentation"
          aria-hidden={page.key !== state.calendarPage.key || undefined}
          inert={page.key !== state.calendarPage.key || undefined}
          in:monthSlide={{
            direction: state.monthMotionDirection * (state.isRtl ? -1 : 1),
          }}
          out:monthSlide={{
            direction: -state.monthMotionDirection * (state.isRtl ? -1 : 1),
          }}
        >
          {@render calendarDays(page)}
        </div>
      {/each}
    </div>
  </div>
</div>
