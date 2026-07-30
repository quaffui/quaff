import type { QTimePeriod } from "./props";

export interface QTime {
  hour: number;
  minute: number;
}

export type QTimeHourCycle = "h11" | "h12" | "h23" | "h24";

export const fallbackTime: QTime = { hour: 0, minute: 0 };

const timeValuePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimeValue(value: string | null | undefined): QTime | null {
  if (!value) {
    return null;
  }

  const match = timeValuePattern.exec(value);

  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

export function formatTimeValue(time: QTime | null) {
  return time ? `${padTimePart(time.hour)}:${padTimePart(time.minute)}` : "";
}

export function getLocalTime(date = new Date()): QTime {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

export function getLocaleHourCycle(locale?: Intl.LocalesArgument): QTimeHourCycle {
  try {
    const options = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();

    return options.hourCycle ?? (options.hour12 ? "h12" : "h23");
  } catch {
    return "h12";
  }
}

export function getLocaleUses24Hour(locale?: Intl.LocalesArgument) {
  const hourCycle = getLocaleHourCycle(locale);
  return hourCycle === "h23" || hourCycle === "h24";
}

export function to12Hour(hour: number): { hour: number; period: QTimePeriod } {
  const normalizedHour = normalizeHour(hour);

  return {
    hour: normalizedHour % 12 || 12,
    period: normalizedHour < 12 ? "am" : "pm",
  };
}

export function from12Hour(hour: number, period: QTimePeriod) {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
    return null;
  }

  return (hour % 12) + (period === "pm" ? 12 : 0);
}

export function parseTimeHourInput(
  value: string,
  format24h: boolean,
  period: QTimePeriod
): number | null {
  if (!/^\d{1,2}$/.test(value)) {
    return null;
  }

  const hour = Number(value);

  if (format24h) {
    return hour >= 0 && hour <= 23 ? hour : null;
  }

  return from12Hour(hour, period);
}

export function parseTimeMinuteInput(value: string) {
  if (!/^\d{1,2}$/.test(value)) {
    return null;
  }

  const minute = Number(value);
  return minute >= 0 && minute <= 59 ? minute : null;
}

export function parseTimeInput(
  hour: string,
  minute: string,
  period: QTimePeriod,
  format24h: boolean
): QTime | null {
  const parsedHour = parseTimeHourInput(hour, format24h, period);
  const parsedMinute = parseTimeMinuteInput(minute);

  return parsedHour === null || parsedMinute === null
    ? null
    : { hour: parsedHour, minute: parsedMinute };
}

export function formatTimeHour(hour: number, format24h: boolean) {
  return padTimePart(format24h ? normalizeHour(hour) : to12Hour(hour).hour);
}

export function formatTimeMinute(minute: number) {
  return padTimePart(normalizeMinute(minute));
}

export function createTimeFormatters(locale: string, format24h: boolean) {
  const formatter = createTimeFormatter(locale, format24h);

  return {
    display: (time: QTime | null) => (time ? formatter.format(createLocalDate(time)) : ""),
    spoken: (time: QTime | null) => (time ? formatter.format(createLocalDate(time)) : ""),
  };
}

function createLocalDate({ hour, minute }: QTime) {
  const date = new Date(2000, 0, 1);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function createTimeFormatter(locale: Intl.LocalesArgument | undefined, format24h: boolean) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: format24h ? "h23" : "h12",
  });
}

function normalizeHour(hour: number) {
  return ((Math.trunc(hour) % 24) + 24) % 24;
}

function normalizeMinute(minute: number) {
  return ((Math.trunc(minute) % 60) + 60) % 60;
}

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}
