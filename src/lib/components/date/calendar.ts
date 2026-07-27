import {
  addCalendarDays,
  compareCalendarDates,
  createUtcDate,
  formatDateValue,
  getDaysInMonth,
  getMonthDays,
  getWeekdayDates,
  isDateWithinRange,
  isSameCalendarDate,
  parseDateValue,
  startOfMonth,
  type QCalendarDate,
} from "./date";
import type {
  QDateDisabledDates,
  QDateDisplayMode,
  QDateLabels,
  QDateValue,
  QDateWeekday,
} from "./props";

export type QDateCalendarView = "calendar" | "months" | "years";

export interface QDateStateSource {
  value: () => QDateValue;
  mask: () => string;
  min: () => string | undefined;
  max: () => string | undefined;
  yearRange: () => readonly [number, number];
  disabledDates: () => QDateDisabledDates | undefined;
  locale: () => string;
  firstDayOfWeek: () => QDateWeekday | undefined;
  labels: () => Partial<QDateLabels> | undefined;
  inputTitle: () => string;
  defaultMode: () => QDateDisplayMode;
  docked: () => boolean;
  autoApply: () => boolean;
  commit: (value: string) => void;
}

export interface QDateConstraints {
  valid: boolean;
  min: QCalendarDate;
  max: QCalendarDate;
  disabledDates?: QDateDisabledDates;
  disabledDateSet?: Set<string>;
}

export type QDateCalendarPage = ReturnType<typeof buildCalendarPage>;
type QDateFormatters = ReturnType<typeof createDateFormatters>;

export const fallbackCalendarDate: QCalendarDate = { year: 2000, month: 0, day: 1 };

export function createDateFormatters(locale: string) {
  const formatter = (options: Intl.DateTimeFormatOptions) => createFormatter(locale, options);
  const display = formatter({ year: "numeric", month: "short", day: "numeric" });
  const headline = formatter({ weekday: "short", month: "short", day: "numeric" });
  const spoken = formatter({
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const monthYear = formatter({ year: "numeric", month: "long" });
  const shortMonth = formatter({ month: "short" });
  const longMonth = formatter({ month: "long" });
  const narrowWeekday = formatter({ weekday: "narrow" });
  const longWeekday = formatter({ weekday: "long" });
  const number = new Intl.NumberFormat(locale, { useGrouping: false });

  return {
    display: (date: QCalendarDate | null) => (date ? display.format(createUtcDate(date)) : ""),
    headline: (date: QCalendarDate) => headline.format(createUtcDate(date)),
    spoken: (date: QCalendarDate) => spoken.format(createUtcDate(date)),
    monthYear: (date: QCalendarDate) => monthYear.format(createUtcDate(date)),
    month: (date: QCalendarDate, width: "short" | "long") =>
      (width === "short" ? shortMonth : longMonth).format(createUtcDate(date)),
    year: (year: number) => number.format(year),
    weekdays: (firstDayOfWeek: number) =>
      getWeekdayDates(firstDayOfWeek).map((date) => ({
        key: formatDateValue(date),
        long: longWeekday.format(createUtcDate(date)),
        narrow: narrowWeekday.format(createUtcDate(date)),
      })),
  };
}

export function getDateConstraints(
  min: string | undefined,
  max: string | undefined,
  yearRange: readonly [number, number],
  disabledDates?: QDateDisabledDates
): QDateConstraints {
  const [yearStart, yearEnd] = normalizeYearRange(yearRange);
  const rangeStart = { year: yearStart, month: 0, day: 1 };
  const rangeEnd = { year: yearEnd, month: 11, day: 31 };
  const minDate = parseDateValue(min);
  const maxDate = parseDateValue(max);
  const effectiveMin =
    minDate && compareCalendarDates(minDate, rangeStart) > 0 ? minDate : rangeStart;
  const effectiveMax = maxDate && compareCalendarDates(maxDate, rangeEnd) < 0 ? maxDate : rangeEnd;

  return {
    valid: compareCalendarDates(effectiveMin, effectiveMax) <= 0,
    min: effectiveMin,
    max: effectiveMax,
    disabledDates,
    disabledDateSet: Array.isArray(disabledDates) ? new Set(disabledDates) : undefined,
  };
}

export function isSelectableDate(date: QCalendarDate, constraints: QDateConstraints) {
  if (
    !constraints.valid ||
    !isDateWithinRange(date, constraints.min, constraints.max) ||
    constraints.disabledDateSet?.has(formatDateValue(date))
  ) {
    return false;
  }

  return (
    typeof constraints.disabledDates !== "function" ||
    !constraints.disabledDates(formatDateValue(date))
  );
}

export function buildCalendarPage(
  displayedMonth: QCalendarDate,
  firstDayOfWeek: number,
  docked: boolean,
  today: QCalendarDate,
  constraints: QDateConstraints,
  formatters: QDateFormatters
) {
  const days = getMonthDays(displayedMonth, firstDayOfWeek, docked);

  return {
    key: `${displayedMonth.year}-${displayedMonth.month}`,
    label: formatters.monthYear(displayedMonth),
    cells: days.map((date) => {
      if (!date) {
        return null;
      }

      return {
        date,
        key: formatDateValue(date),
        label: formatters.spoken(date),
        number: formatters.year(date.day),
        selectable: isSelectableDate(date, constraints),
        today: isSameCalendarDate(date, today),
        outside: date.month !== displayedMonth.month || date.year !== displayedMonth.year,
      };
    }),
  };
}

export function getMonthOptions(
  displayedYear: number,
  constraints: QDateConstraints,
  formatters: QDateFormatters
) {
  return Array.from({ length: 12 }, (_, month) => {
    const date = { year: displayedYear, month, day: 1 };

    return {
      date,
      label: formatters.month(date, "long"),
      selectable: isMonthWithinRange(date, constraints),
    };
  });
}

export function getSelectableYears(constraints: QDateConstraints) {
  if (!constraints.valid) {
    return [];
  }

  return Array.from(
    { length: constraints.max.year - constraints.min.year + 1 },
    (_, index) => constraints.min.year + index
  );
}

export function getOptionTarget(
  values: number[],
  current: number,
  key: string,
  columns = 1,
  rtl = false
) {
  const index = values.indexOf(current);
  let target = index;

  if (key === "ArrowLeft" && columns > 1) {
    target += rtl ? 1 : -1;
  } else if (key === "ArrowRight" && columns > 1) {
    target += rtl ? -1 : 1;
  } else if (key === "ArrowUp") {
    target -= columns;
  } else if (key === "ArrowDown") {
    target += columns;
  } else if (key === "Home") {
    target = columns > 1 ? index - (index % columns) : 0;
  } else if (key === "End") {
    target = columns > 1 ? index + columns - 1 - (index % columns) : values.length - 1;
  } else if (key === "PageUp") {
    target -= 12;
  } else if (key === "PageDown") {
    target += 12;
  } else {
    return;
  }

  return values[Math.max(0, Math.min(values.length - 1, target))];
}

export function getInitialDate(
  committedDate: QCalendarDate | null,
  today: QCalendarDate,
  constraints: QDateConstraints
) {
  if (!constraints.valid) {
    return null;
  }

  if (committedDate && isSelectableDate(committedDate, constraints)) {
    return committedDate;
  }

  if (isSelectableDate(today, constraints)) {
    return today;
  }

  const candidate =
    compareCalendarDates(today, constraints.min) < 0
      ? constraints.min
      : compareCalendarDates(today, constraints.max) > 0
        ? constraints.max
        : today;

  return getFocusableDateInMonth(startOfMonth(candidate), candidate.day, constraints);
}

export function clampCalendarDate(date: QCalendarDate, constraints: QDateConstraints) {
  if (!constraints.valid) {
    return date;
  }

  if (compareCalendarDates(date, constraints.min) < 0) {
    return constraints.min;
  }

  return compareCalendarDates(date, constraints.max) > 0 ? constraints.max : date;
}

export function findSelectableDateInMonth(
  date: QCalendarDate,
  direction: 1 | -1,
  constraints: QDateConstraints
) {
  let candidate = date;

  while (candidate.year === date.year && candidate.month === date.month) {
    if (isSelectableDate(candidate, constraints)) {
      return candidate;
    }

    candidate = addCalendarDays(candidate, direction);
  }

  return null;
}

export function getAvailableMonthInYear(
  year: number,
  preferredMonth: number,
  constraints: QDateConstraints
) {
  const firstMonth = constraints.min.year === year ? constraints.min.month : 0;
  const lastMonth = constraints.max.year === year ? constraints.max.month : 11;
  const month = Math.max(firstMonth, Math.min(lastMonth, preferredMonth));

  return { year, month, day: 1 };
}

export function getFocusableDateInMonth(
  month: QCalendarDate,
  preferredDay: number,
  constraints: QDateConstraints
) {
  if (!constraints.valid || !isMonthWithinRange(month, constraints)) {
    return null;
  }

  const firstDay =
    constraints.min.year === month.year && constraints.min.month === month.month
      ? constraints.min.day
      : 1;
  const lastDay =
    constraints.max.year === month.year && constraints.max.month === month.month
      ? constraints.max.day
      : getDaysInMonth(month.year, month.month);
  const clampedDay = Math.max(firstDay, Math.min(lastDay, preferredDay));
  const days = [
    ...Array.from({ length: lastDay - clampedDay + 1 }, (_, index) => clampedDay + index),
    ...Array.from({ length: clampedDay - firstDay }, (_, index) => clampedDay - index - 1),
  ];
  const day = days.find((value) =>
    isSelectableDate({ year: month.year, month: month.month, day: value }, constraints)
  );

  return day === undefined ? null : { year: month.year, month: month.month, day };
}

export function isMonthWithinRange(month: QCalendarDate, constraints: QDateConstraints) {
  const ordinal = (date: QCalendarDate) => date.year * 12 + date.month;
  return (
    constraints.valid &&
    ordinal(month) >= ordinal(constraints.min) &&
    ordinal(month) <= ordinal(constraints.max)
  );
}

export function getLocalToday(): QCalendarDate {
  const today = new Date();

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  };
}

function normalizeYearRange(range: readonly [number, number]): readonly [number, number] {
  const rawStart = Number.isFinite(range[0]) ? Math.trunc(range[0]) : 1900;
  const rawEnd = Number.isFinite(range[1]) ? Math.trunc(range[1]) : 2100;
  const start = Math.max(1, Math.min(rawStart, rawEnd, 9999));
  const end = Math.max(1, Math.min(Math.max(rawStart, rawEnd), 9999));

  return [start, end];
}

function createFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, {
    calendar: "gregory",
    timeZone: "UTC",
    ...options,
  });
}
