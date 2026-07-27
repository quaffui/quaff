export interface QCalendarDate {
  year: number;
  month: number;
  day: number;
}

export const defaultDateMask = "YYYY-MM-DD";

const dateMaskTokens = ["YYYY", "MM", "DD"] as const;
const inputTokens = { year: "YYYY", month: "MM", day: "DD" } as const;

export function createUtcDate({ year, month, day }: QCalendarDate) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date;
}

export function getCalendarDate(date: Date): QCalendarDate {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

export function parseDateValue(
  value: string | null | undefined,
  mask = defaultDateMask
): QCalendarDate | null {
  if (!value) {
    return null;
  }

  const pattern = createDateValuePattern(mask);
  const match = pattern?.expression.exec(value);

  if (!match || !pattern) {
    return null;
  }

  const parsed: QCalendarDate = { year: 0, month: 0, day: 0 };

  pattern.order.forEach((part, index) => {
    parsed[part] = Number(match[index + 1]);
  });
  parsed.month -= 1;

  if (parsed.year < 1 || parsed.year > 9999) {
    return null;
  }

  const date = createUtcDate(parsed);

  return isSameCalendarDate(getCalendarDate(date), parsed) ? parsed : null;
}

export function formatDateValue(date: QCalendarDate | null, mask = defaultDateMask) {
  if (!date) {
    return "";
  }

  const values = {
    YYYY: String(date.year).padStart(4, "0"),
    MM: String(date.month + 1).padStart(2, "0"),
    DD: String(date.day).padStart(2, "0"),
  };

  return mask.replace(/YYYY|MM|DD/g, (token) => values[token as keyof typeof values]);
}

export function isValidDateMask(mask: string) {
  return createDateValuePattern(mask) !== null;
}

export function isSameCalendarDate(first: QCalendarDate | null, second: QCalendarDate | null) {
  return (
    first !== null &&
    second !== null &&
    first.year === second.year &&
    first.month === second.month &&
    first.day === second.day
  );
}

export function compareCalendarDates(first: QCalendarDate, second: QCalendarDate) {
  return createUtcDate(first).getTime() - createUtcDate(second).getTime();
}

export function addCalendarDays(date: QCalendarDate, days: number) {
  const next = createUtcDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return getCalendarDate(next);
}

export function addCalendarMonths(date: QCalendarDate, months: number) {
  const nextMonth = createUtcDate({ year: date.year, month: date.month + months, day: 1 });
  const lastDay = getDaysInMonth(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth());

  nextMonth.setUTCDate(Math.min(date.day, lastDay));
  return getCalendarDate(nextMonth);
}

export function startOfMonth(date: QCalendarDate) {
  return { year: date.year, month: date.month, day: 1 };
}

export function getDaysInMonth(year: number, month: number) {
  return createUtcDate({ year, month: month + 1, day: 0 }).getUTCDate();
}

export function getMonthDays(
  date: QCalendarDate,
  firstDayOfWeek: number,
  includeAdjacentMonthDays = false
) {
  const monthStart = startOfMonth(date);
  const leadingDays =
    (createUtcDate(monthStart).getUTCDay() - normalizeFirstDay(firstDayOfWeek) + 7) % 7;
  const lastDay = getDaysInMonth(date.year, date.month);
  const gridStart = addCalendarDays(monthStart, -leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    if (includeAdjacentMonthDays) {
      return addCalendarDays(gridStart, index);
    }

    const day = index - leadingDays + 1;
    return day > 0 && day <= lastDay ? { year: date.year, month: date.month, day } : null;
  });
}

export function getWeekdayDates(firstDayOfWeek: number) {
  const firstSunday = { year: 2021, month: 7, day: 1 };
  const firstDay = normalizeFirstDay(firstDayOfWeek);

  return Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(firstSunday, (firstDay + index) % 7)
  );
}

export function isDateWithinRange(
  date: QCalendarDate,
  min: QCalendarDate | null,
  max: QCalendarDate | null
) {
  return (
    (!min || compareCalendarDates(date, min) >= 0) && (!max || compareCalendarDates(date, max) <= 0)
  );
}

export function getLocaleFirstDayOfWeek(locale?: Intl.LocalesArgument) {
  try {
    const localeInfo = new Intl.Locale(
      new Intl.DateTimeFormat(locale).resolvedOptions().locale
    ) as Intl.Locale & {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    return ((localeInfo.weekInfo ?? localeInfo.getWeekInfo?.())?.firstDay ?? 7) % 7;
  } catch {
    return 0;
  }
}

export function getDateInputMask(locale?: Intl.LocalesArgument) {
  const formatter = new Intl.DateTimeFormat(locale, {
    calendar: "gregory",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    numberingSystem: "latn",
    timeZone: "UTC",
  });
  const parts = formatter.formatToParts(new Date(Date.UTC(2001, 10, 22)));
  const tokens = parts.flatMap((part) =>
    part.type in inputTokens ? [inputTokens[part.type as keyof typeof inputTokens]] : []
  );
  const separator = getSupportedInputSeparator(
    parts.find((part) => part.type === "literal")?.value
  );

  return tokens.join(separator);
}

function createDateValuePattern(mask: string) {
  const order: Array<keyof QCalendarDate> = [];
  let expression = "^";

  for (let index = 0; index < mask.length; ) {
    const token = dateMaskTokens.find((candidate) => mask.startsWith(candidate, index));

    if (token) {
      order.push(token === "YYYY" ? "year" : token === "MM" ? "month" : "day");
      expression += token === "YYYY" ? "(\\d{4})" : "(\\d{2})";
      index += token.length;
    } else {
      expression += mask[index].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      index += 1;
    }
  }

  return order.length === 3 && new Set(order).size === 3
    ? { expression: new RegExp(`${expression}$`), order }
    : null;
}

function normalizeFirstDay(firstDayOfWeek: number) {
  return ((Math.trunc(firstDayOfWeek) % 7) + 7) % 7;
}

function getSupportedInputSeparator(literal: string | undefined) {
  return literal?.match(/[./-]/)?.[0] ?? (literal && /\s/.test(literal) ? " " : "/");
}
