import { describe, expect, it } from "vitest";
import { parseDateValue } from "$components/date/date";
import { defaultDateLabels } from "$components/date/props";
import { createDateState } from "./stateFixture.svelte";

function date(value: string) {
  return parseDateValue(value)!;
}

const INITIAL_RANGE = { start: "2026-09-02", end: "2026-09-08" };

describe("date range selection", () => {
  it("waits for both endpoints before auto-applying a range", () => {
    const { state, commits } = createDateState({ autoApply: true });
    state.selectDate(date("2026-09-02"));
    expect(commits).toEqual([]);
    expect(state.canConfirm).toBe(false);
    state.selectDate(date("2026-09-08"));
    expect(commits).toEqual([INITIAL_RANGE]);
  });

  it("supports same-day ranges and labels both endpoints", () => {
    const { state, commits } = createDateState();
    const selected = date("2026-09-02");
    state.selectDate(selected);
    state.selectDate(selected);
    state.commitSelection();
    expect(commits).toEqual([{ start: "2026-09-02", end: "2026-09-02" }]);
    expect(state.dayLabel(selected, "September 2")).toBe("September 2, Start date, End date");
    expect(state.isSelected(date("2026-09-03"))).toBe(false);
  });

  it("restarts on an earlier second date or a click after completion", () => {
    const { state } = createDateState();
    state.selectDate(date("2026-09-08"));
    state.selectDate(date("2026-09-02"));
    expect(state.draftDate).toEqual(date("2026-09-02"));
    expect(state.draftEndDate).toBe(null);
    state.selectDate(date("2026-09-08"));
    expect(state.isSelected(date("2026-09-05"))).toBe(true);
    expect(state.isRangeStart(date("2026-09-02"))).toBe(true);
    expect(state.isRangeEnd(date("2026-09-08"))).toBe(true);
    state.selectDate(date("2026-09-12"));
    expect(state.draftDate).toEqual(date("2026-09-12"));
    expect(state.draftEndInput).toBe("");
    expect(state.canConfirm).toBe(false);
  });

  it.each([
    ["list", ["2026-09-05"]],
    ["predicate", (value: string) => value === "2026-09-05"],
  ] as const)("rejects ranges crossing a disabled date from a %s", (_, disabledDates) => {
    const { state, commits } = createDateState({ disabledDates, autoApply: true });
    state.selectDate(date("2026-09-02"));
    state.selectDate(date("2026-09-08"));
    expect(commits).toEqual([]);
    expect(state.draftDate).toEqual(date("2026-09-02"));
    expect(state.draftEndDate).toBe(null);
    expect(state.rangeValidationMessage).toBe(defaultDateLabels.unavailableRange);
    expect(state.isSelected(date("2026-09-05"))).toBe(false);
    state.selectDate(date("2026-09-04"));
    expect(state.rangeValidationMessage).toBe("");
    expect(commits).toEqual([{ start: "2026-09-02", end: "2026-09-04" }]);
  });

  it("discards an uncommitted draft when a new session begins", () => {
    const { state, config } = createDateState({ value: INITIAL_RANGE });
    state.selectDate(date("2026-10-02"));
    expect(config.value).toEqual(INITIAL_RANGE);
    state.beginSession(false);
    expect(state.draftDate).toEqual(date(INITIAL_RANGE.start));
    expect(state.draftEndDate).toEqual(date(INITIAL_RANGE.end));
  });

  it("keeps single-date auto-apply and value formatting unchanged", () => {
    const { state, commits } = createDateState({
      range: false,
      autoApply: true,
      mask: "DD/MM/YYYY",
    });
    state.selectDate(date("2026-09-02"));
    expect(commits).toEqual(["02/09/2026"]);
    expect(state.isRangeStart(date("2026-09-02"))).toBe(false);
    expect(state.isSelected(date("2026-09-03"))).toBe(false);
  });
});

describe("range text entry", () => {
  it("uses localized input for both endpoints and the configured model mask on commit", () => {
    const { state, commits } = createDateState({ locale: "de-DE", mask: "DD/MM/YYYY" });
    state.updateDraftInput("02.09.2026");
    state.updateDraftInput("08.09.2026", "end");
    state.commitSelection();
    expect(commits).toEqual([{ start: "02/09/2026", end: "08/09/2026" }]);
    expect(state.inputValidationMessage).toBe("");
    expect(state.endInputValidationMessage).toBe("");
  });

  it("validates incomplete, reversed, and disabled ranges without silently reordering", () => {
    const { state, commits } = createDateState({ disabledDates: ["2026-09-05"] });
    state.updateDraftInput("09/08/2026");
    state.updateDraftInput("09/", "end");
    state.validateDraftInput("end");
    expect(state.endInputValidationMessage).toBe(defaultDateLabels.invalidDate);
    state.updateDraftInput("09/02/2026", "end");
    expect(state.rangeValidationMessage).toBe(defaultDateLabels.invalidRange);
    expect(state.draftDate).toEqual(date("2026-09-08"));
    state.commitSelection();
    expect(commits).toEqual([]);
    state.updateDraftInput("09/02/2026");
    state.updateDraftInput("09/08/2026", "end");
    expect(state.rangeValidationMessage).toBe(defaultDateLabels.unavailableRange);
    state.updateDraftInput("09/04/2026", "end");
    expect(state.rangeValidationMessage).toBe("");
    expect(state.canConfirm).toBe(true);
  });

  it("reports unavailable endpoints on their own fields", () => {
    const { state } = createDateState({ min: "2026-09-02", max: "2026-09-08" });
    state.updateDraftInput("09/01/2026");
    state.updateDraftInput("09/09/2026", "end");
    expect(state.inputValidationMessage).toBe(defaultDateLabels.unavailableDate);
    expect(state.endInputValidationMessage).toBe(defaultDateLabels.unavailableDate);
    expect(state.canConfirm).toBe(false);
  });

  it("does not mark an end-only draft as a selected range endpoint", () => {
    const { state } = createDateState();
    state.updateDraftInput("09/08/2026", "end");
    const end = date("2026-09-08");
    expect(state.isRangeEnd(end)).toBe(false);
    expect(state.isSelected(end)).toBe(false);
    expect(state.dayLabel(end, "September 8")).toBe("September 8");
  });

  it("preserves both endpoints when switching modes and only auto-submits complete ranges", () => {
    const { state, commits } = createDateState({ autoApply: true, defaultMode: "input" });
    expect(state.headline).toBe("Enter dates");
    state.updateDraftInput("09/02/2026");
    state.submitDraftInput();
    expect(commits).toEqual([]);
    state.updateDraftInput("09/08/2026", "end");
    state.toggleDisplayMode();
    state.toggleDisplayMode();
    expect(state.draftInput).toBe("09/02/2026");
    expect(state.draftEndInput).toBe("09/08/2026");
    state.submitDraftInput("end");
    expect(commits).toEqual([INITIAL_RANGE]);
  });
});

describe("range state reconciliation", () => {
  it("detects endpoint mutations on the same external object", () => {
    const { state, config } = createDateState({ value: { ...INITIAL_RANGE } });
    const value = config.value;

    if (!value || typeof value === "string") {
      throw new Error("Expected a range value");
    }

    value.end = "2026-10-12";
    state.synchronizeExternalValue(value);
    expect(state.draftEndDate).toEqual(date("2026-10-12"));
    expect(state.fieldDisplayValue).toContain("Oct 12, 2026");
    state.selectDate(date("2026-11-01"));
    state.synchronizeExternalValue(value);
    expect(state.draftDate).toEqual(date("2026-11-01"));
    expect(state.draftEndDate).toBe(null);
  });

  it("revalidates disabled interiors and endpoints when constraints change", () => {
    const { state, config } = createDateState({ value: INITIAL_RANGE });
    config.disabledDates = ["2026-09-05"];
    state.reconcileOpenSession();
    expect(state.canConfirm).toBe(false);
    expect(state.rangeValidationMessage).toBe(defaultDateLabels.unavailableRange);
    config.disabledDates = ["2026-09-08"];
    state.reconcileOpenSession();
    expect(state.draftEndDate).toBe(null);
    expect(state.endInputValidationMessage).toBe(defaultDateLabels.unavailableDate);
    config.disabledDates = undefined;
    state.reconcileOpenSession();
    expect(state.draftEndDate).toEqual(date("2026-09-08"));
    expect(state.canConfirm).toBe(true);
  });

  it("restores unavailable draft endpoints after locale and constraint changes", () => {
    const { state, config } = createDateState({
      disabledDates: ["2026-09-02", "2026-09-08"],
    });
    state.updateDraftInput("09/02/2026");
    state.updateDraftInput("09/08/2026", "end");
    config.locale = "de-DE";
    state.reconcileOpenSession();
    expect(state.draftInput).toBe("02.09.2026");
    expect(state.draftEndInput).toBe("08.09.2026");
    expect(state.canConfirm).toBe(false);
    config.disabledDates = undefined;
    state.reconcileOpenSession();
    expect(state.draftDate).toEqual(date(INITIAL_RANGE.start));
    expect(state.draftEndDate).toEqual(date(INITIAL_RANGE.end));
    expect(state.canConfirm).toBe(true);
  });

  it("clears a rejected calendar attempt when constraints are changed", () => {
    const { state, config } = createDateState({ disabledDates: ["2026-09-05"] });
    state.selectDate(date("2026-09-02"));
    state.selectDate(date("2026-09-08"));
    expect(state.rangeValidationMessage).toBe(defaultDateLabels.unavailableRange);
    config.disabledDates = undefined;
    state.reconcileOpenSession();
    expect(state.rangeValidationMessage).toBe("");
    expect(state.canConfirm).toBe(false);
    state.selectDate(date("2026-09-08"));
    expect(state.canConfirm).toBe(true);
  });

  it("reformats both endpoints when locale changes and clears end state when leaving range mode", () => {
    const { state, config } = createDateState({ value: INITIAL_RANGE });
    config.locale = "de-DE";
    state.reconcileOpenSession();
    expect(state.draftInput).toBe("02.09.2026");
    expect(state.draftEndInput).toBe("08.09.2026");
    config.range = false;
    config.value = "2026-09-12";
    state.synchronizeExternalValue(config.value);
    expect(state.draftDate).toEqual(date("2026-09-12"));
    expect(state.draftEndDate).toBe(null);
    expect(state.draftEndInput).toBe("");
    expect(state.canConfirm).toBe(true);
  });

  it("validates external reversed, unavailable, and malformed range values", () => {
    const { state, config } = createDateState({
      value: { start: "2026-09-08", end: "2026-09-02" },
    });
    expect(state.valueValidationMessage).toBe(defaultDateLabels.invalidRange);
    config.value = { ...INITIAL_RANGE };
    config.disabledDates = ["2026-09-05"];
    expect(state.valueValidationMessage).toBe(defaultDateLabels.unavailableRange);
    config.value.end = "not a date";
    expect(state.valueValidationMessage).toBe(defaultDateLabels.invalidDate);
    config.value = null;
    expect(state.valueValidationMessage).toBe("");
  });
});
