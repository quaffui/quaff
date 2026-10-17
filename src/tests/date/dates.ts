import { parseDateValue } from "#components/date/date.js";

/** Parses a date test value that is known to be valid. */
export function parseDate(value: string) {
  return parseDateValue(value)!;
}
