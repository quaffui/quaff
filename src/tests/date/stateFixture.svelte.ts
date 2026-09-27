import QDateState from "$components/date/dateState.svelte";
import type { QDateStateSource } from "$components/date/calendar";
import type { QDateValue } from "$components/date/props";

type StateOptions = {
  [Key in Exclude<keyof QDateStateSource, "commit">]: ReturnType<QDateStateSource[Key]>;
};

export function createDateState(options: Partial<StateOptions> = {}) {
  const config = $state<StateOptions>({
    value: null,
    range: true,
    mask: "YYYY-MM-DD",
    min: undefined,
    max: undefined,
    yearRange: [2020, 2030],
    disabledDates: undefined,
    locale: "en-US",
    firstDayOfWeek: undefined,
    labels: undefined,
    inputTitle: "Enter dates",
    defaultMode: "calendar",
    docked: false,
    autoApply: false,
    ...options,
  });
  const commits: QDateValue<boolean>[] = [];
  const state = new QDateState({
    value: () => config.value,
    range: () => config.range,
    mask: () => config.mask,
    min: () => config.min,
    max: () => config.max,
    yearRange: () => config.yearRange,
    disabledDates: () => config.disabledDates,
    locale: () => config.locale,
    firstDayOfWeek: () => config.firstDayOfWeek,
    labels: () => config.labels,
    inputTitle: () => config.inputTitle,
    defaultMode: () => config.defaultMode,
    docked: () => config.docked,
    autoApply: () => config.autoApply,
    commit: (value) => {
      commits.push(value);
      config.value = value;
    },
  });
  state.beginSession(false);
  return { state, config, commits };
}
