import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { getDateConstraints, getDateRangeValidation } from "$components/date/calendar";
import { parseDateValue } from "$components/date/date";
import type { QDateProps, QDateRangeValue } from "$components/date/props";

function date(value: string) {
  return parseDateValue(value)!;
}

describe("inclusive date range constraints", () => {
  it.each([
    ["2024-02-28", "2024-03-01"],
    ["2025-12-31", "2026-01-01"],
    ["2026-09-02", "2026-09-02"],
  ])("accepts an available interval from %s to %s", (start, end) => {
    const constraints = getDateConstraints(start, end, [2020, 2030]);
    expect(getDateRangeValidation(date(start), date(end), constraints)).toBe(null);
  });

  it("rejects reversed intervals and endpoints beyond inclusive limits", () => {
    const constraints = getDateConstraints("2026-09-02", "2026-09-08", [2020, 2030]);
    expect(getDateRangeValidation(date("2026-09-08"), date("2026-09-02"), constraints)).toBe(
      "invalidRange"
    );
    expect(getDateRangeValidation(date("2026-09-01"), date("2026-09-08"), constraints)).toBe(
      "unavailableRange"
    );
    expect(getDateRangeValidation(date("2026-09-02"), date("2026-09-09"), constraints)).toBe(
      "unavailableRange"
    );
  });

  it("respects year bounds and contradictory constraints", () => {
    const years = getDateConstraints(undefined, undefined, [2025, 2026]);
    const impossible = getDateConstraints("2026-10-01", "2026-09-01", [2025, 2026]);
    expect(getDateRangeValidation(date("2024-12-31"), date("2025-01-01"), years)).toBe(
      "unavailableRange"
    );
    expect(getDateRangeValidation(date("2026-09-01"), date("2026-10-01"), impossible)).toBe(
      "unavailableRange"
    );
  });

  it("checks leap days inside the range and stops at the first disabled interior date", () => {
    const disabledDates = vi.fn((value: string) => value === "2024-02-29");
    const constraints = getDateConstraints(undefined, undefined, [2020, 2030], disabledDates);
    expect(getDateRangeValidation(date("2024-02-28"), date("2024-03-02"), constraints)).toBe(
      "unavailableRange"
    );
    expect(disabledDates).toHaveBeenCalledWith("2024-02-29");
    expect(disabledDates).not.toHaveBeenCalledWith("2024-03-01");
  });

  it("ignores malformed disabled values consistently with individual day selection", () => {
    const constraints = getDateConstraints(
      undefined,
      undefined,
      [2020, 2030],
      ["2026-02-30", "2026-2-28"]
    );
    expect(getDateRangeValidation(date("2026-02-28"), date("2026-03-01"), constraints)).toBe(null);
  });

  it("preserves single-date binding types and exposes an explicit range model", () => {
    expectTypeOf<QDateProps["value"]>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<QDateProps<true>["value"]>().toEqualTypeOf<QDateRangeValue | null | undefined>();
    expectTypeOf<QDateProps<boolean>["value"]>().toEqualTypeOf<
      string | QDateRangeValue | null | undefined
    >();
  });
});
